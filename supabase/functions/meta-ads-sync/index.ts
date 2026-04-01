import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GRAPH_API = "https://graph.facebook.com/v21.0";

/** Extract result count from actions array — checks lead, schedule, and website schedule */
function extractResults(actions: { action_type: string; value: string }[] | undefined): number {
  if (!actions || actions.length === 0) return 0;

  // Priority order: lead first, then schedule variants
  const priorityTypes = [
    "lead",
    "schedule",
    "onsite_conversion.lead_grouped",
    "offsite_conversion.fb_pixel_schedule",
    "onsite_conversion.messaging_first_reply",
  ];

  for (const actionType of priorityTypes) {
    const found = actions.find((a) => a.action_type === actionType);
    if (found) {
      const val = parseInt(found.value, 10);
      if (val > 0) return val;
    }
  }

  return 0;
}

/** Fetch all pages of insights from Meta API */
async function fetchAllInsights(url: string): Promise<any[]> {
  const allData: any[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const res = await fetch(nextUrl);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Meta API error [${res.status}]: ${errText}`);
    }
    const json = await res.json();
    allData.push(...(json.data || []));
    nextUrl = json.paging?.next || null;
  }

  return allData;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const META_TOKEN = Deno.env.get("META_ADS_TOKEN");
    if (!META_TOKEN) throw new Error("META_ADS_TOKEN secret not configured");

    let AD_ACCOUNT_ID = Deno.env.get("META_AD_ACCOUNT_ID");
    if (!AD_ACCOUNT_ID) throw new Error("META_AD_ACCOUNT_ID secret not configured");
    AD_ACCOUNT_ID = AD_ACCOUNT_ID.replace(/^act[=_]?/, "");
    AD_ACCOUNT_ID = `act_${AD_ACCOUNT_ID}`;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let datePreset = "last_30d";
    let month = new Date().toISOString().slice(0, 7);
    try {
      const body = await req.json();
      datePreset = body.datePreset || datePreset;
      month = body.month || month;
    } catch { /* no body */ }

    const baseFields = "spend,impressions,clicks,actions";
    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    // ─── 1. Campaign level ───
    const campaignUrl = `${GRAPH_API}/${AD_ACCOUNT_ID}/insights?fields=campaign_name,${baseFields}&date_preset=${datePreset}&level=campaign&limit=500&access_token=${META_TOKEN}`;
    const campaigns = await fetchAllInsights(campaignUrl);
    console.log(`Fetched ${campaigns.length} campaigns`);

    for (const c of campaigns) {
      const spend = parseFloat(c.spend || "0");
      const clicks = parseInt(c.clicks || "0", 10);
      const impressions = parseInt(c.impressions || "0", 10);
      const results = extractResults(c.actions);

      totalSpend += spend;
      totalClicks += clicks;
      totalImpressions += impressions;

      // Upsert ad_spend
      await supabase.from("ad_spend").upsert(
        { channel: "Meta", month, amount: spend, clicks, impressions, product: c.campaign_name || "Unknown Campaign" },
        { onConflict: "channel,month,product" }
      );

      // Upsert utm_performance at campaign level
      if (c.campaign_name) {
        await supabase.from("utm_performance").upsert(
          { utm: c.campaign_name, month, spend, total_leads: results, level: "campaign", campaign_name: c.campaign_name },
          { onConflict: "utm,month,level" }
        );
      }
    }

    // ─── 2. Adset level ───
    const adsetUrl = `${GRAPH_API}/${AD_ACCOUNT_ID}/insights?fields=campaign_name,adset_name,${baseFields}&date_preset=${datePreset}&level=adset&limit=500&access_token=${META_TOKEN}`;
    const adsets = await fetchAllInsights(adsetUrl);
    console.log(`Fetched ${adsets.length} adsets`);

    for (const as of adsets) {
      if (!as.adset_name) continue;
      const spend = parseFloat(as.spend || "0");
      const results = extractResults(as.actions);

      await supabase.from("utm_performance").upsert(
        { utm: as.adset_name, month, spend, total_leads: results, level: "adset", campaign_name: as.campaign_name || null, adset_name: as.adset_name },
        { onConflict: "utm,month,level" }
      );
    }

    // ─── 3. Ad level ───
    const adUrl = `${GRAPH_API}/${AD_ACCOUNT_ID}/insights?fields=campaign_name,adset_name,ad_name,${baseFields}&date_preset=${datePreset}&level=ad&limit=500&access_token=${META_TOKEN}`;
    const ads = await fetchAllInsights(adUrl);
    console.log(`Fetched ${ads.length} ads`);

    for (const ad of ads) {
      if (!ad.ad_name) continue;
      const spend = parseFloat(ad.spend || "0");
      const results = extractResults(ad.actions);

      await supabase.from("utm_performance").upsert(
        { utm: ad.ad_name, month, spend, total_leads: results, level: "ad", campaign_name: ad.campaign_name || null, adset_name: ad.adset_name || null },
        { onConflict: "utm,month,level" }
      );
    }

    // Update integration status
    await supabase
      .from("integrations")
      .update({ status: "connected", last_sync_at: new Date().toISOString(), leads_imported: totalClicks })
      .eq("name", "Meta Ads");

    const summary = {
      success: true,
      campaignsProcessed: campaigns.length,
      adsetsProcessed: adsets.length,
      adsProcessed: ads.length,
      totalSpend,
      totalClicks,
      totalImpressions,
      syncedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Meta Ads sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
