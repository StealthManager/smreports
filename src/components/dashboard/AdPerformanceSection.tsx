import { useAdPerformanceData } from "@/hooks/useAdPerformanceData";
import { utmPerformance as staticUtm } from "@/data/dashboard-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";

export function AdPerformanceSection() {
  const { data: liveData, loading } = useAdPerformanceData();

  const source = liveData.length > 0
    ? liveData
    : staticUtm.map((d) => ({ ...d, spend: 0 }));
  const isLive = liveData.length > 0;

  const sorted = [...source].sort((a, b) => b.spend - a.spend);

  const chartData = sorted.slice(0, 10).map((d) => ({
    name: d.utm.length > 35 ? d.utm.slice(0, 35) + "…" : d.utm,
    spend: "spend" in d ? d.spend : 0,
    leads: d.totalLeads,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ad Performance & UTM Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Creative performance by ad, spend and conversion quality
          {!isLive && <span className="ml-2 text-xs text-warning">(sample data)</span>}
        </p>
      </div>

      {/* Spend by Ad Chart */}
      <div className="card-dashboard p-6 animate-slide-up">
        <h3 className="section-header mb-4">Spend by Ad Creative</h3>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} barSize={28} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(220 10% 46%)" }} width={220} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "spend" ? `$${value.toLocaleString()}` : value,
                name === "spend" ? "Spend" : "Leads",
              ]}
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }}
            />
            <Bar dataKey="spend" fill="hsl(210 100% 56%)" radius={[0, 6, 6, 0]} />
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
                {["Ad / UTM", "Spend", "Total Leads", "% Hot Leads", "% Won", "Quality Score"].map((h) => (
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
                    <td className="px-6 py-3.5 font-mono tabular-nums">${("spend" in row ? row.spend : 0).toLocaleString()}</td>
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
