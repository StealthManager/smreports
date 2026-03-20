import { utmPerformance } from "@/data/dashboard-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function AdPerformanceSection() {
  const sorted = [...utmPerformance].sort((a, b) => b.totalLeads - a.totalLeads);
  const chartData = sorted.slice(0, 8).map((d) => ({
    name: d.utm.length > 30 ? d.utm.slice(0, 30) + "…" : d.utm,
    leads: d.totalLeads,
    hotRate: d.hotRate,
    wonRate: d.wonRate,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ad Performance & UTM Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">Creative performance by ad, lead volume and conversion quality</p>
      </div>

      {/* Chart */}
      <div className="card-dashboard p-6 animate-slide-up">
        <h3 className="section-header mb-4">Leads by Ad Creative</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barSize={28} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(220 10% 46%)" }} width={200} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
            <Bar dataKey="leads" fill="hsl(160 84% 39%)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="card-dashboard overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="p-6 pb-0"><h3 className="section-header">UTM Performance Detail</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Ad / UTM", "Total Leads", "% Hot Leads", "% Won", "Quality Score"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const quality = row.hotRate * 0.4 + row.wonRate * 0.6;
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-3.5 font-medium max-w-xs truncate">{row.utm}</td>
                    <td className="px-6 py-3.5 font-mono tabular-nums">{row.totalLeads}</td>
                    <td className="px-6 py-3.5 font-mono tabular-nums">{row.hotRate.toFixed(1)}%</td>
                    <td className="px-6 py-3.5 font-mono tabular-nums text-metric-positive">{row.wonRate.toFixed(1)}%</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(quality, 100)}%` }} />
                        </div>
                        <span className="text-xs font-mono tabular-nums text-muted-foreground">{quality.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
