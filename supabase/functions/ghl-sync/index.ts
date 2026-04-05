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
  pipelineId?: string;
  status?: string;
  source?: string;
  assignedTo?: string;
  createdAt?: string;
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
    let listPipelines = false;
    try {
      const body = await req.json();
      locationId = body.locationId || "";
      pipelineId = body.pipelineId || "";
      listPipelines = body.listPipelines || false;
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

    // --- List pipelines mode ---
    if (listPipelines) {
      const res = await fetch(`${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`, {
        headers: ghlHeaders,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`GHL pipelines API error [${res.status}]: ${errText}`);
      }
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, pipelines: data.pipelines || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Fetch pipeline stages from pipelines list endpoint ---
    const stageMap: Record<string, string> = {};
    try {
      const res = await fetch(`${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`, {
        headers: ghlHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        const pipelines = data.pipelines || [];
        for (const pl of pipelines) {
          if (pipelineId && pl.id !== pipelineId) continue;
          for (const s of (pl.stages || [])) {
            stageMap[s.id] = s.name;
          }
        }
        console.log("Pipeline stages found:", JSON.stringify(stageMap));
      }
    } catch (e) {
      console.error("Failed to fetch pipeline stages:", e);
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

    // Log unique statuses, stage IDs and pipeline IDs
    const uniqueStatuses = new Set<string>();
    const uniqueStageNames = new Set<string>();
    const uniquePipelineIds = new Set<string>();
    for (const opp of opportunities) {
      if (opp.status) uniqueStatuses.add(opp.status);
      if (opp.pipelineStageId && stageMap[opp.pipelineStageId]) {
        uniqueStageNames.add(stageMap[opp.pipelineStageId]);
      }
      if (opp.pipelineId) uniquePipelineIds.add(opp.pipelineId);
    }
    console.log("Unique statuses:", JSON.stringify([...uniqueStatuses]));
    console.log("Unique stage names:", JSON.stringify([...uniqueStageNames]));
    console.log("Unique pipeline IDs:", JSON.stringify([...uniquePipelineIds]));

    // --- Map pipeline stage using stage name ---
    function mapStage(opp: GHLOpportunity): string {
      const stageName = opp.pipelineStageId ? stageMap[opp.pipelineStageId] : undefined;
      const name = (stageName || "").toLowerCase();
      const status = (opp.status || "").toLowerCase();

      if (name.includes("won") || name.includes("closed") || name.includes("client")) return "opportunity_won";
      if (name.includes("hot")) return "hot_lead";
      if (name.includes("unpaid") || name.includes("invoice")) return "unpaid_invoice";
      if (name.includes("no show") || name.includes("noshow") || name.includes("no-show")) return "no_show";
      if (name.includes("not a good fit") || name.includes("bad fit") || name.includes("disqualified")) return "not_a_good_fit";
      if (name.includes("general") || name.includes("warm") || name.includes("qualified") || name.includes("booked")) return "general_lead";
      if (name.includes("new") || name.includes("cold") || name.includes("prospect")) return "cold_lead";

      if (status === "won") return "opportunity_won";
      if (status === "lost" || status === "abandoned") return "not_a_good_fit";
      if (status === "open") return "general_lead";

      return "cold_lead";
    }

    // --- Deduplicate by contact ID (keep the latest/highest value) ---
    const contactMap = new Map<string, ReturnType<typeof buildLeadRow>>();
    
    function buildLeadRow(opp: GHLOpportunity) {
      const contactId = opp.contact?.id || opp.id;
      return {
        ghl_contact_id: contactId,
        name: opp.contact?.name || opp.name || "Unknown",
        company: opp.contact?.companyName || null,
        pipeline_stage: mapStage(opp),
        deal_size: opp.monetaryValue || 0,
        revenue: opp.status === "won" ? (opp.monetaryValue || 0) : 0,
        source: opp.source || null,
        created_at: opp.createdAt || new Date().toISOString(),
      };
    }

    for (const opp of opportunities) {
      const row = buildLeadRow(opp);
      const existing = contactMap.get(row.ghl_contact_id);
      // Keep the one with higher deal_size or won status
      if (!existing || row.deal_size > existing.deal_size || row.pipeline_stage === "opportunity_won") {
        contactMap.set(row.ghl_contact_id, row);
      }
    }

    const uniqueLeads = [...contactMap.values()];
    console.log(`Deduplicated to ${uniqueLeads.length} unique leads`);

    // --- Batch upsert ---
    let upserted = 0;
    let errors = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < uniqueLeads.length; i += BATCH_SIZE) {
      const batch = uniqueLeads.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from("leads")
        .upsert(batch, { onConflict: "ghl_contact_id" });

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
      uniqueContacts: uniqueLeads.length,
      leadsUpserted: upserted,
      errors,
      pipelineStages: stageMap,
      uniqueStatuses: [...uniqueStatuses],
      uniqueStageNames: [...uniqueStageNames],
      uniquePipelineIds: [...uniquePipelineIds],
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
