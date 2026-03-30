import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UtmRow {
  utm: string;
  totalLeads: number;
  hotRate: number;
  wonRate: number;
  spend: number;
}

export function useAdPerformanceData() {
  const [data, setData] = useState<UtmRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data: rows } = await supabase
          .from("utm_performance")
          .select("utm, total_leads, hot_rate, won_rate, spend")
          .order("spend", { ascending: false });

        if (rows && rows.length > 0) {
          setData(
            rows.map((r) => ({
              utm: r.utm,
              totalLeads: r.total_leads ?? 0,
              hotRate: r.hot_rate ?? 0,
              wonRate: r.won_rate ?? 0,
              spend: r.spend ?? 0,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch UTM data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { data, loading };
}
