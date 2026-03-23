import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GRAPH_API = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const META_TOKEN = Deno.env.get("META_ADS_TOKEN");
    if (!META_TOKEN) throw new Error("META_ADS_TOKEN secret not configured");

    const AD_ACCOUNT_ID = Deno.env.get("META_AD_ACCOUNT_ID");
    if (!AD_ACCOUNT_ID) throw new Error("META_AD_ACCOUNT_ID secret not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse optional date range
    let datePreset = "last_30d";
    let month = new Date().toISOString().slice(0, 7); // YYYY-MM
    try {
      const body = await req.json();
      datePreset = body.datePreset || datePreset;
      month = body.month || month;
    } catch {
      // no body
    }

    // --- Fetch campaign insights ---
    const insightsUrl = `${GRAPH_API}/${AD_ACCOUNT_ID}/insights?fields=campaign_name,spend,impressions,clicks,actions&date_preset=${datePreset}&level=campaign&limit=500&access_token=${META_TOKEN}`;

    const insightsRes = await fetch(insightsUrl);
    if (!insightsRes.ok) {
      const errText = await insightsRes.text();
      throw new Error(`Meta Ads API error [${insightsRes.status}]: ${errText}`);
    }
    const insightsData = await insightsRes.json();
    const campaigns = insightsData.data || [];

    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let upserted = 0;

    for (const campaign of campaigns) {
      const spend = parseFloat(campaign.spend || "0");
      const clicks = parseInt(campaign.clicks || "0", 10);
      const impressions = parseInt(campaign.impressions || "0", 10);

      totalSpend += spend;
      totalClicks += clicks;
      totalImpressions += impressions;

      // Get lead actions count
      const leadActions = (campaign.actions || []).find(
        (a: { action_type: string }) => a.action_type === "lead"
      );
      const leadCount = leadActions ? parseInt(leadActions.value, 10) : 0;

      // Upsert into ad_spend
      const { error: spendError } = await supabase.from("ad_spend").upsert(
        {
          channel: "Meta",
          month,
          amount: spend,
          clicks,
          impressions,
          product: campaign.campaign_name || "Unknown Campaign",
        },
        { onConflict: "channel,month,product" }
      );

      if (spendError) {
        console.error("Ad spend upsert error:", spendError.message);
      } else {
        upserted++;
      }

      // Upsert into utm_performance
      if (campaign.campaign_name) {
        await supabase.from("utm_performance").upsert(
          {
            utm: campaign.campaign_name,
            month,
            spend,
            total_leads: leadCount,
          },
          { onConflict: "utm,month" }
        );
      }
    }

    // --- Fetch ad-level data for creative UTMs ---
    const adsUrl = `${GRAPH_API}/${AD_ACCOUNT_ID}/insights?fields=ad_name,spend,impressions,clicks,actions&date_preset=${datePreset}&level=ad&limit=500&access_token=${META_TOKEN}`;
    const adsRes = await fetch(adsUrl);
    let adsProcessed = 0;

    if (adsRes.ok) {
      const adsData = await adsRes.json();
      for (const ad of adsData.data || []) {
        if (!ad.ad_name) continue;

        const leadActions = (ad.actions || []).find(
          (a: { action_type: string }) => a.action_type === "lead"
        );
        const leadCount = leadActions ? parseInt(leadActions.value, 10) : 0;
        const spend = parseFloat(ad.spend || "0");

        await supabase.from("utm_performance").upsert(
          {
            utm: ad.ad_name,
            month,
            spend,
            total_leads: leadCount,
          },
          { onConflict: "utm,month" }
        );
        adsProcessed++;
      }
    } else {
      const errText = await adsRes.text();
      console.error("Ad-level fetch error:", errText);
    }

    // Update integration status
    await supabase
      .from("integrations")
      .update({
        status: "connected",
        last_sync_at: new Date().toISOString(),
        leads_imported: totalClicks,
      })
      .eq("name", "Meta Ads");

    const summary = {
      success: true,
      campaignsProcessed: campaigns.length,
      adsProcessed,
      totalSpend,
      totalClicks,
      totalImpressions,
      adSpendUpserted: upserted,
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
