import { leads, type LeadStage } from "@/data/dashboard-data";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const stageColors: Record<string, string> = {
  "Hot Lead": "hsl(0 72% 51%)",
  "General Lead": "hsl(38 92% 50%)",
  "Cold Lead": "hsl(210 100% 56%)",
  "Opportunity Won": "hsl(160 84% 39%)",
  "Unpaid Invoice": "hsl(280 67% 60%)",
  "Not a good fit": "hsl(220 10% 70%)",
  "No Show": "hsl(220 10% 85%)",
};

const stageBg: Record<string, string> = {
  "Hot Lead": "bg-destructive/10 text-destructive",
  "General Lead": "bg-warning/10 text-warning",
  "Cold Lead": "bg-info/10 text-info",
  "Opportunity Won": "bg-primary/10 text-primary",
  "Unpaid Invoice": "bg-purple-100 text-purple-700",
  "Not a good fit": "bg-muted text-muted-foreground",
  "No Show": "bg-muted text-muted-foreground",
};

export function LeadQualitySection() {
  const [selectedCloser, setSelectedCloser] = useState<string>("All");
  const closers = ["All", "Will", "Erik", "Willian"];

  const filtered = useMemo(
    () => selectedCloser === "All" ? leads : leads.filter((l) => l.closer === selectedCloser),
    [selectedCloser]
  );

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((l) => { counts[l.pipelineStage] = (counts[l.pipelineStage] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const qualificationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((l) => { counts[l.qualification] = (counts[l.qualification] || 0) + 1; });
    return counts;
  }, [filtered]);

  const totalDealValue = filtered.reduce((sum, l) => sum + l.dealSize, 0);
  const wonDeals = filtered.filter((l) => l.pipelineStage === "Opportunity Won");
  const hotLeads = filtered.filter((l) => l.pipelineStage === "Hot Lead");
  const unpaid = filtered.filter((l) => l.pipelineStage === "Unpaid Invoice");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Quality Analysis</h1>
          <p className="text-muted-foreground text-sm mt-1">Pipeline stages, qualification, and conversion metrics</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {closers.map((c) => (
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
                    <span className={`status-badge ${stageBg[lead.pipelineStage] || "bg-muted text-muted-foreground"}`}>{lead.pipelineStage}</span>
                  </td>
                  <td className="px-5 py-3">{lead.service}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.source}</td>
                  <td className="px-5 py-3 font-mono tabular-nums">${lead.dealSize.toLocaleString()}</td>
                  <td className="px-5 py-3"><span className={`status-badge ${lead.qualification === "SQL" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{lead.qualification}</span></td>
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
