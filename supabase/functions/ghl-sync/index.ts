import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_BASE = "https://services.leadconnectorhq.com";

interface GHLContact {
  id: string;
  contactName?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, string>[];
  dateAdded?: string;
}

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

    // Parse optional body params
    let locationId = "";
    let pipelineId = "";
    try {
      const body = await req.json();
      locationId = body.locationId || "";
      pipelineId = body.pipelineId || "";
    } catch {
      // no body is fine
    }

    const ghlHeaders = {
      Authorization: `Bearer ${GHL_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    };

    // --- Fetch contacts ---
    let contacts: GHLContact[] = [];
    let nextPageUrl = `${GHL_BASE}/contacts/?locationId=${locationId}&limit=100`;

    if (locationId) {
      let page = 0;
      while (nextPageUrl && page < 10) {
        const res = await fetch(nextPageUrl, { headers: ghlHeaders });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`GHL contacts API error [${res.status}]: ${errText}`);
        }
        const data = await res.json();
        contacts = contacts.concat(data.contacts || []);
        nextPageUrl = data.meta?.nextPageUrl || "";
        page++;
      }
    }

    // --- Fetch opportunities ---
    let opportunities: GHLOpportunity[] = [];
    if (locationId) {
      let oppPage = `${GHL_BASE}/opportunities/search?location_id=${locationId}&limit=100${pipelineId ? `&pipeline_id=${pipelineId}` : ""}`;
      let oPage = 0;
      while (oppPage && oPage < 10) {
        const res = await fetch(oppPage, {
          method: "GET",
          headers: ghlHeaders,
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`GHL opportunities API error [${res.status}]: ${errText}`);
        }
        const data = await res.json();
        opportunities = opportunities.concat(data.opportunities || []);
        oppPage = data.meta?.nextPageUrl || "";
        oPage++;
      }
    }

    // --- Map pipeline stage ---
    function mapStage(status?: string): string {
      if (!status) return "cold_lead";
      const s = status.toLowerCase();
      if (s.includes("won") || s.includes("closed")) return "opportunity_won";
      if (s.includes("hot")) return "hot_lead";
      if (s.includes("unpaid") || s.includes("invoice")) return "unpaid_invoice";
      if (s.includes("no show") || s.includes("noshow")) return "no_show";
      if (s.includes("not a good fit") || s.includes("bad fit")) return "not_a_good_fit";
      if (s.includes("general") || s.includes("warm")) return "general_lead";
      return "cold_lead";
    }

    // --- Upsert leads from opportunities ---
    let upserted = 0;
    let errors = 0;

    for (const opp of opportunities) {
      const contactId = opp.contact?.id || opp.id;
      const leadData = {
        ghl_contact_id: contactId,
        name: opp.contact?.name || opp.name || "Unknown",
        company: opp.contact?.companyName || null,
        pipeline_stage: mapStage(opp.status),
        deal_size: opp.monetaryValue || 0,
        source: opp.source || null,
      };

      const { error } = await supabase
        .from("leads")
        .upsert(leadData, { onConflict: "ghl_contact_id" });

      if (error) {
        console.error("Upsert error:", error.message);
        errors++;
      } else {
        upserted++;
      }
    }

    // If no opportunities but we have contacts, import those
    if (opportunities.length === 0 && contacts.length > 0) {
      for (const c of contacts) {
        const name = c.contactName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unknown";
        const leadData = {
          ghl_contact_id: c.id,
          name,
          company: c.companyName || null,
          pipeline_stage: "cold_lead" as const,
          source: c.source || null,
        };

        const { error } = await supabase
          .from("leads")
          .upsert(leadData, { onConflict: "ghl_contact_id" });

        if (error) {
          console.error("Contact upsert error:", error.message);
          errors++;
        } else {
          upserted++;
        }
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
      contactsFetched: contacts.length,
      opportunitiesFetched: opportunities.length,
      leadsUpserted: upserted,
      errors,
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
