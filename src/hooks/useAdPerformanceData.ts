import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DateRange } from "@/components/dashboard/DateRangeFilter";

export interface UtmRow {
  utm: string;
  totalLeads: number;
  hotRate: number;
  wonRate: number;
  spend: number;
  level: "campaign" | "adset" | "ad";
  campaignName: string | null;
  adsetName: string | null;
}

export function useAdPerformanceData(dateRange?: DateRange) {
  const [data, setData] = useState<UtmRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let query = supabase
          .from("utm_performance")
          .select("utm, total_leads, hot_rate, won_rate, spend, level, campaign_name, adset_name")
          .order("spend", { ascending: false });

        if (dateRange) {
          const fromMonth = dateRange.from.toISOString().slice(0, 7);
          const toMonth = dateRange.to.toISOString().slice(0, 7);
          query = query.gte("month", fromMonth).lte("month", toMonth);
        }

        const { data: rows } = await query;

        if (rows && rows.length > 0) {
          setData(
            rows.map((r: any) => ({
              utm: r.utm,
              totalLeads: r.total_leads ?? 0,
              hotRate: r.hot_rate ?? 0,
              wonRate: r.won_rate ?? 0,
              spend: r.spend ?? 0,
              level: r.level ?? "ad",
              campaignName: r.campaign_name ?? null,
              adsetName: r.adset_name ?? null,
            }))
          );
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Failed to fetch UTM data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dateRange?.from?.toISOString(), dateRange?.to?.toISOString()]);

  return { data, loading };
}
