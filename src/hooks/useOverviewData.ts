import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CloserPerf {
  name: string;
  calls: number;
  completed: number;
  showUp: number;
  clients: number;
  spent: number;
  revenue: number;
  roas: number;
  convRate: number;
  avgTicket: number;
  avgSalesCycle: number;
}

interface OverviewMetrics {
  totalSpent: number;
  totalSpentByProduct: Record<string, number>;
  callsBooked: number;
  callsCompleted: number;
  showUpCalls: number;
  clientCount: number;
  newRevenue: number;
  recurringRevenue: number;
  totalROAS: number;
  month: string;
}

interface WeeklyApproval {
  week: string;
  total: number;
  approved: number;
  rate: number;
}

export function useOverviewData() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [closerPerformance, setCloserPerformance] = useState<CloserPerf[]>([]);
  const [weeklyApproval, setWeeklyApproval] = useState<WeeklyApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, adSpendRes, closersRes] = await Promise.all([
        supabase.from("leads").select("*"),
        supabase.from("ad_spend").select("*"),
        supabase.from("closers").select("*"),
      ]);

      const leads = leadsRes.data || [];
      const adSpend = adSpendRes.data || [];
      const closers = closersRes.data || [];

      // Build closer name map
      const closerMap: Record<string, string> = {};
      closers.forEach((c) => { closerMap[c.id] = c.name; });

      // Ad spend totals
      const totalSpent = adSpend.reduce((s, r) => s + Number(r.amount), 0);
      const spendByProduct: Record<string, number> = {};
      adSpend.forEach((r) => {
        const prod = r.product || "Unknown";
        spendByProduct[prod] = (spendByProduct[prod] || 0) + Number(r.amount);
      });

      // Lead metrics
      const wonLeads = leads.filter((l) => l.pipeline_stage === "opportunity_won");
      const hotLeads = leads.filter((l) => l.pipeline_stage === "hot_lead");
      const showUpLeads = leads.filter((l) => l.show_up);
      const newRevenue = wonLeads.reduce((s, l) => s + Number(l.revenue || l.deal_size || 0), 0);
      // Estimate recurring as deals with WL/CA services
      const recurringRevenue = wonLeads
        .filter((l) => ["WL", "CA", "WL + AM", "WL + CFAM"].includes(l.service || ""))
        .reduce((s, l) => s + Number(l.revenue || l.deal_size || 0), 0);

      const totalROAS = totalSpent > 0 ? parseFloat((newRevenue / totalSpent).toFixed(2)) : 0;

      // Closer performance
      const closerIds = [...new Set(leads.map((l) => l.closer_id).filter(Boolean))];
      const closerSpend: Record<string, number> = {};
      adSpend.forEach((r) => {
        if (r.closer_id) {
          closerSpend[r.closer_id] = (closerSpend[r.closer_id] || 0) + Number(r.amount);
        }
      });

      const closerPerf: CloserPerf[] = closerIds.map((cid) => {
        const cLeads = leads.filter((l) => l.closer_id === cid);
        const cWon = cLeads.filter((l) => l.pipeline_stage === "opportunity_won");
        const cShowUp = cLeads.filter((l) => l.show_up);
        const cRevenue = cWon.reduce((s, l) => s + Number(l.revenue || l.deal_size || 0), 0);
        const cSpent = closerSpend[cid!] || 0;
        const cycles = cWon.filter((l) => l.sales_cycle_days).map((l) => l.sales_cycle_days!);
        const avgCycle = cycles.length > 0 ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0;

        return {
          name: closerMap[cid!] || "Unknown",
          calls: cLeads.length,
          completed: cLeads.length,
          showUp: cShowUp.length,
          clients: cWon.length,
          spent: cSpent,
          revenue: cRevenue,
          roas: cSpent > 0 ? parseFloat((cRevenue / cSpent).toFixed(2)) : 0,
          convRate: cLeads.length > 0 ? parseFloat(((cWon.length / cLeads.length) * 100).toFixed(2)) : 0,
          avgTicket: cWon.length > 0 ? parseFloat((cRevenue / cWon.length).toFixed(2)) : 0,
          avgSalesCycle: parseFloat(avgCycle.toFixed(1)),
        };
      });

      // Weekly approval (group leads by week of first_call_date)
      const weekMap: Record<string, { total: number; approved: number }> = {};
      leads.forEach((l) => {
        if (!l.first_call_date) return;
        const d = new Date(l.first_call_date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
        if (!weekMap[key]) weekMap[key] = { total: 0, approved: 0 };
        weekMap[key].total++;
        if (["hot_lead", "opportunity_won"].includes(l.pipeline_stage)) {
          weekMap[key].approved++;
        }
      });

      const weekly = Object.entries(weekMap)
        .map(([week, v]) => ({
          week,
          total: v.total,
          approved: v.approved,
          rate: parseFloat(((v.approved / v.total) * 100).toFixed(2)),
        }))
        .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

      const now = new Date();
      const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      setMetrics({
        totalSpent,
        totalSpentByProduct: spendByProduct,
        callsBooked: leads.length,
        callsCompleted: leads.length,
        showUpCalls: showUpLeads.length,
        clientCount: wonLeads.length,
        newRevenue,
        recurringRevenue,
        totalROAS,
        month: monthLabel,
      });
      setCloserPerformance(closerPerf);
      setWeeklyApproval(weekly);
    } catch (err) {
      console.error("Failed to fetch overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, closerPerformance, weeklyApproval, loading };
}
