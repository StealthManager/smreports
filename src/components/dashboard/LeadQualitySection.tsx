import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { leads as staticLeads, type LeadStage } from "@/data/dashboard-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DateRangeFilter, getDefaultRange, type DateRange } from "./DateRangeFilter";
import { TagFilter } from "./TagFilter";
import { useAllLeadTags } from "@/hooks/useAllLeadTags";
import { Loader2 } from "lucide-react";

const stageColors: Record<string, string> = {
  "hot_lead": "hsl(0 72% 51%)",
  "general_lead": "hsl(38 92% 50%)",
  "cold_lead": "hsl(210 100% 56%)",
  "opportunity_won": "hsl(160 84% 39%)",
  "unpaid_invoice": "hsl(280 67% 60%)",
  "not_a_good_fit": "hsl(220 10% 70%)",
  "no_show": "hsl(220 10% 85%)",
  // static data labels
  "Hot Lead": "hsl(0 72% 51%)",
  "General Lead": "hsl(38 92% 50%)",
  "Cold Lead": "hsl(210 100% 56%)",
  "Opportunity Won": "hsl(160 84% 39%)",
  "Unpaid Invoice": "hsl(280 67% 60%)",
  "Not a good fit": "hsl(220 10% 70%)",
  "No Show": "hsl(220 10% 85%)",
};

const stageLabels: Record<string, string> = {
  hot_lead: "Hot Lead",
  general_lead: "General Lead",
  cold_lead: "Cold Lead",
  opportunity_won: "Opportunity Won",
  unpaid_invoice: "Unpaid Invoice",
  not_a_good_fit: "Not a good fit",
  no_show: "No Show",
};

const stageBg: Record<string, string> = {
  "hot_lead": "bg-destructive/10 text-destructive",
  "general_lead": "bg-warning/10 text-warning",
  "cold_lead": "bg-info/10 text-info",
  "opportunity_won": "bg-primary/10 text-primary",
  "unpaid_invoice": "bg-purple-100 text-purple-700",
  "not_a_good_fit": "bg-muted text-muted-foreground",
  "no_show": "bg-muted text-muted-foreground",
  "Hot Lead": "bg-destructive/10 text-destructive",
  "General Lead": "bg-warning/10 text-warning",
  "Cold Lead": "bg-info/10 text-info",
  "Opportunity Won": "bg-primary/10 text-primary",
  "Unpaid Invoice": "bg-purple-100 text-purple-700",
  "Not a good fit": "bg-muted text-muted-foreground",
  "No Show": "bg-muted text-muted-foreground",
};

interface LeadRow {
  name: string;
  closer: string;
  company: string;
  pipelineStage: string;
  service: string;
  source: string;
  dealSize: number;
  qualification: string;
}

export function LeadQualitySection() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());
  const [selectedCloser, setSelectedCloser] = useState<string>("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { tags: allTags } = useAllLeadTags();
  const [dbLeads, setDbLeads] = useState<LeadRow[]>([]);
  const [closerNames, setCloserNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      try {
        const fromStr = dateRange.from.toISOString();
        const toStr = dateRange.to.toISOString();

        const [leadsRes, closersRes] = await Promise.all([
          supabase.from("leads").select("*").gte("created_at", fromStr).lte("created_at", toStr),
          supabase.from("closers").select("*"),
        ]);

        let leads = leadsRes.data || [];
        // Filter by selected tags
        if (selectedTags.length > 0) {
          leads = leads.filter((l) => {
            const lt = (l.tags as string[] | null) || [];
            return selectedTags.some((t) => lt.includes(t));
          });
        }
        const closers = closersRes.data || [];
        const closerMap: Record<string, string> = {};
        closers.forEach((c) => { closerMap[c.id] = c.name; });

        if (leads.length > 0) {
          setIsLive(true);
          setDbLeads(leads.map((l) => ({
            name: l.name,
            closer: closerMap[l.closer_id || ""] || "Unassigned",
            company: l.company || "",
            pipelineStage: l.pipeline_stage,
            service: l.service || "",
            source: l.source || "",
            dealSize: Number(l.deal_size || 0),
            qualification: l.qualification || "N/A",
          })));
          setCloserNames(["All", ...new Set(leads.map((l) => closerMap[l.closer_id || ""] || "Unassigned"))]);
        } else {
          setIsLive(false);
          setDbLeads([]);
        }
      } catch (err) {
        console.error("Failed to fetch leads:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [dateRange.from.toISOString(), dateRange.to.toISOString(), selectedTags.join(",")]);

  const allLeads = isLive ? dbLeads : staticLeads.map((l) => ({
    ...l,
    pipelineStage: l.pipelineStage,
  }));
  const closerList = isLive ? closerNames : ["All", "Will", "Erik", "Willian"];

  const filtered = useMemo(
    () => selectedCloser === "All" ? allLeads : allLeads.filter((l) => l.closer === selectedCloser),
    [selectedCloser, allLeads]
  );

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((l) => {
      const label = stageLabels[l.pipelineStage] || l.pipelineStage;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const qualificationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((l) => { counts[l.qualification] = (counts[l.qualification] || 0) + 1; });
    return counts;
  }, [filtered]);

  const totalDealValue = filtered.reduce((sum, l) => sum + l.dealSize, 0);
  const wonDeals = filtered.filter((l) => l.pipelineStage === "opportunity_won" || l.pipelineStage === "Opportunity Won");
  const hotLeads = filtered.filter((l) => l.pipelineStage === "hot_lead" || l.pipelineStage === "Hot Lead");
  const unpaid = filtered.filter((l) => l.pipelineStage === "unpaid_invoice" || l.pipelineStage === "Unpaid Invoice");

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lead Quality Analysis</h1>
            <p className="text-muted-foreground text-sm mt-1">Loading...</p>
          </div>
          <div className="flex items-center gap-2">
            <TagFilter tags={allTags} selected={selectedTags} onChange={setSelectedTags} />
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Quality Analysis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pipeline stages, qualification, and conversion metrics
            {!isLive && <span className="ml-2 text-xs text-warning">(sample data)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TagFilter tags={allTags} selected={selectedTags} onChange={setSelectedTags} />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {closerList.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCloser(c)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedCloser === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        <SummaryCard label="Total Leads" value={filtered.length} />
        <SummaryCard label="Hot Leads" value={hotLeads.length} color="text-destructive" />
        <SummaryCard label="Won" value={wonDeals.length} color="text-metric-positive" />
        <SummaryCard label="Unpaid Invoices" value={unpaid.length} color="text-warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="card-dashboard p-6 animate-slide-up" style={{ animationDelay: "80ms" }}>
          <h3 className="section-header mb-4">Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stageCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                {stageCounts.map((entry) => (
                  <Cell key={entry.name} fill={stageColors[entry.name] || "hsl(220 10% 70%)"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {stageCounts.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stageColors[s.name] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        {/* Qualification Breakdown */}
        <div className="card-dashboard p-6 animate-slide-up" style={{ animationDelay: "140ms" }}>
          <h3 className="section-header mb-4">Qualification Breakdown</h3>
          <div className="space-y-4 mt-6">
            {Object.entries(qualificationCounts).map(([qual, count]) => (
              <div key={qual}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{qual}</span>
                  <span className="text-sm font-mono tabular-nums text-muted-foreground">{count} ({((count / filtered.length) * 100).toFixed(1)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(count / filtered.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-foreground">${totalDealValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Lead Table */}
      <div className="card-dashboard overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="p-6 pb-0"><h3 className="section-header">Lead Details</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Closer", "Company", "Stage", "Service", "Source", "Deal Size", "Qualification"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((lead, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 font-medium">{lead.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.closer}</td>
                  <td className="px-5 py-3">{lead.company}</td>
                  <td className="px-5 py-3">
                    <span className={`status-badge ${stageBg[lead.pipelineStage] || "bg-muted text-muted-foreground"}`}>
                      {stageLabels[lead.pipelineStage] || lead.pipelineStage}
                    </span>
                  </td>
                  <td className="px-5 py-3">{lead.service}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.source}</td>
                  <td className="px-5 py-3 font-mono tabular-nums">${lead.dealSize.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`status-badge ${lead.qualification === "SQL" || lead.qualification === "sql_qualified" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {lead.qualification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="card-dashboard p-4">
      <p className="metric-label">{label}</p>
      <p className={`metric-value mt-1 ${color || "text-foreground"}`}>{value}</p>
    </div>
  );
}
