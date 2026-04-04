import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_BASE = "https://services.leadconnectorhq.com";

interface GHLOpportunity {
  id: string;
  name?: string;
  contact?: { id: string; name?: string; companyName?: string };
  monetaryValue?: number;
  pipelineStageId?: string;
  status?: string;
  source?: string;
  assignedTo?: string;
  dateAdded?: string;
  customFields?: Record<string, string>[];
}

interface PipelineStage {
  id: string;
  name: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_TOKEN = Deno.env.get("GHL_API_TOKEN");
    if (!GHL_TOKEN) throw new Error("GHL_API_TOKEN secret not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let locationId = "";
    let pipelineId = "";
    try {
      const body = await req.json();
      locationId = body.locationId || "";
      pipelineId = body.pipelineId || "";
    } catch {
      // no body is fine
    }

    if (!locationId) {
      return new Response(JSON.stringify({ success: false, error: "locationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ghlHeaders = {
      Authorization: `Bearer ${GHL_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    };

    // --- Fetch pipeline stages to build a name map ---
    const stageMap: Record<string, string> = {};
    if (pipelineId) {
      try {
        const res = await fetch(`${GHL_BASE}/opportunities/pipelines/${pipelineId}?locationId=${locationId}`, {
          headers: ghlHeaders,
        });
        if (res.ok) {
          const data = await res.json();
          const stages: PipelineStage[] = data.pipeline?.stages || data.stages || [];
          for (const s of stages) {
            stageMap[s.id] = s.name;
          }
          console.log("Pipeline stages found:", JSON.stringify(stageMap));
        }
      } catch (e) {
        console.error("Failed to fetch pipeline stages:", e);
      }
    }

    // --- Fetch opportunities ---
    let opportunities: GHLOpportunity[] = [];
    let oppPage = `${GHL_BASE}/opportunities/search?location_id=${locationId}&limit=100${pipelineId ? `&pipeline_id=${pipelineId}` : ""}`;
    let oPage = 0;
    while (oppPage && oPage < 20) {
      const res = await fetch(oppPage, { method: "GET", headers: ghlHeaders });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`GHL opportunities API error [${res.status}]: ${errText}`);
      }
      const data = await res.json();
      opportunities = opportunities.concat(data.opportunities || []);
      oppPage = data.meta?.nextPageUrl || "";
      oPage++;
    }

    console.log(`Fetched ${opportunities.length} opportunities`);

    // Log unique statuses and stage IDs for debugging
    const uniqueStatuses = new Set<string>();
    const uniqueStageIds = new Set<string>();
    for (const opp of opportunities) {
      if (opp.status) uniqueStatuses.add(opp.status);
      if (opp.pipelineStageId) uniqueStageIds.add(opp.pipelineStageId);
    }
    console.log("Unique statuses:", JSON.stringify([...uniqueStatuses]));
    console.log("Unique stageIds:", JSON.stringify([...uniqueStageIds]));

    // --- Map pipeline stage using stage name from stageMap ---
    function mapStage(opp: GHLOpportunity): string {
      // First try stage name from pipeline stages
      const stageName = opp.pipelineStageId ? stageMap[opp.pipelineStageId] : undefined;
      const name = (stageName || "").toLowerCase();
      const status = (opp.status || "").toLowerCase();

      // Check stage name first (more specific)
      if (name.includes("won") || name.includes("closed") || name.includes("client")) return "opportunity_won";
      if (name.includes("hot")) return "hot_lead";
      if (name.includes("unpaid") || name.includes("invoice")) return "unpaid_invoice";
      if (name.includes("no show") || name.includes("noshow") || name.includes("no-show")) return "no_show";
      if (name.includes("not a good fit") || name.includes("bad fit") || name.includes("disqualified")) return "not_a_good_fit";
      if (name.includes("general") || name.includes("warm") || name.includes("qualified") || name.includes("booked")) return "general_lead";
      if (name.includes("new") || name.includes("cold") || name.includes("prospect")) return "cold_lead";

      // Fallback to status
      if (status === "won") return "opportunity_won";
      if (status === "lost" || status === "abandoned") return "not_a_good_fit";
      if (status === "open") return "general_lead";

      return "cold_lead";
    }

    // --- Batch upsert leads ---
    let upserted = 0;
    let errors = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < opportunities.length; i += BATCH_SIZE) {
      const batch = opportunities.slice(i, i + BATCH_SIZE);
      const rows = batch.map((opp) => {
        const contactId = opp.contact?.id || opp.id;
        const stageName = opp.pipelineStageId ? stageMap[opp.pipelineStageId] : undefined;
        return {
          ghl_contact_id: contactId,
          name: opp.contact?.name || opp.name || "Unknown",
          company: opp.contact?.companyName || null,
          pipeline_stage: mapStage(opp),
          deal_size: opp.monetaryValue || 0,
          revenue: opp.status === "won" ? (opp.monetaryValue || 0) : 0,
          source: opp.source || null,
        };
      });

      const { error, count } = await supabase
        .from("leads")
        .upsert(rows, { onConflict: "ghl_contact_id" });

      if (error) {
        console.error(`Batch upsert error (batch ${i / BATCH_SIZE}):`, error.message);
        errors += batch.length;
      } else {
        upserted += batch.length;
      }
    }

    // Update integration status
    await supabase
      .from("integrations")
      .update({
        status: "connected",
        last_sync_at: new Date().toISOString(),
        leads_imported: upserted,
      })
      .eq("name", "GoHighLevel");

    const summary = {
      success: true,
      opportunitiesFetched: opportunities.length,
      leadsUpserted: upserted,
      errors,
      pipelineStages: stageMap,
      uniqueStatuses: [...uniqueStatuses],
      syncedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("GHL sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
