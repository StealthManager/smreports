import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DateRange } from "@/components/dashboard/DateRangeFilter";

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

export function useOverviewData(dateRange?: DateRange, selectedTags?: string[]) {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [closerPerformance, setCloserPerformance] = useState<CloserPerf[]>([]);
  const [weeklyApproval, setWeeklyApproval] = useState<WeeklyApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), selectedTags?.join(",")]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let leadsQuery = supabase.from("leads").select("*");
      let adSpendQuery = supabase.from("ad_spend").select("*");
      const closersQuery = supabase.from("closers").select("*");
      const recurringTagsQuery = supabase.from("recurring_revenue_tags").select("tag");

      if (dateRange) {
        const fromStr = dateRange.from.toISOString();
        const toStr = dateRange.to.toISOString();
        leadsQuery = leadsQuery.gte("created_at", fromStr).lte("created_at", toStr);
        // ad_spend uses month column (YYYY-MM)
        const fromMonth = dateRange.from.toISOString().slice(0, 7);
        const toMonth = dateRange.to.toISOString().slice(0, 7);
        adSpendQuery = adSpendQuery.gte("month", fromMonth).lte("month", toMonth);
      }

      const [leadsRes, adSpendRes, closersRes, recurringTagsRes] = await Promise.all([
        leadsQuery,
        adSpendQuery,
        closersQuery,
        recurringTagsQuery,
      ]);

      let leads = leadsRes.data || [];
      const adSpend = adSpendRes.data || [];
      const closers = closersRes.data || [];
      const recurringTagsList = (recurringTagsRes.data || []).map((r) => r.tag);

      // Filter by selected tags if provided
      if (selectedTags && selectedTags.length > 0) {
        leads = leads.filter((l) => {
          const lt = (l.tags as string[] | null) || [];
          return selectedTags.some((t) => lt.includes(t));
        });
      }

      const closerMap: Record<string, string> = {};
      closers.forEach((c) => { closerMap[c.id] = c.name; });

      const totalSpent = adSpend.reduce((s, r) => s + Number(r.amount), 0);
      const spendByProduct: Record<string, number> = {};
      adSpend.forEach((r) => {
        const prod = r.product || "Unknown";
        spendByProduct[prod] = (spendByProduct[prod] || 0) + Number(r.amount);
      });

      const wonLeads = leads.filter((l) => l.pipeline_stage === "opportunity_won");
      const showUpLeads = leads.filter((l) => l.show_up);
      const newRevenue = wonLeads.reduce((s, l) => s + Number(l.revenue || l.deal_size || 0), 0);
      const recurringRevenue = wonLeads
        .filter((l) => {
          const lt = (l.tags as string[] | null) || [];
          return lt.some((t) => recurringTagsList.includes(t));
        })
        .reduce((s, l) => s + Number(l.revenue || l.deal_size || 0), 0);

      const totalROAS = totalSpent > 0 ? parseFloat((newRevenue / totalSpent).toFixed(2)) : 0;

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

      const monthLabel = dateRange
        ? `${dateRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${dateRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

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
