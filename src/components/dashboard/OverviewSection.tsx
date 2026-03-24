import { useOverviewData } from "@/hooks/useOverviewData";
import { overviewMetrics as staticMetrics, closerPerformance as staticClosers, weeklyApproval as staticWeekly } from "@/data/dashboard-data";
import { MetricCard } from "./MetricCard";
import { DollarSign, Users, PhoneCall, TrendingUp, Target, Repeat, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

export function OverviewSection() {
  const { metrics: dbMetrics, closerPerformance: dbClosers, weeklyApproval: dbWeekly, loading } = useOverviewData();

  // Use DB data if available, otherwise fall back to static
  const hasDbData = dbMetrics && dbMetrics.totalSpent > 0;
  const metrics = hasDbData ? dbMetrics : staticMetrics;
  const closers = dbClosers.length > 0 ? dbClosers : staticClosers;
  const weekly = dbWeekly.length > 0 ? dbWeekly : staticWeekly;

  const spendByProduct = Object.entries(metrics.totalSpentByProduct)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 16) + "…" : name, value }));

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
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {metrics.month} — Stealth Agency Performance
          {!hasDbData && <span className="ml-2 text-xs text-warning">(sample data)</span>}
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-slide-up">
        <MetricCard icon={DollarSign} label="Total Spent" value={`$${metrics.totalSpent.toLocaleString()}`} />
        <MetricCard icon={TrendingUp} label="New Revenue" value={`$${metrics.newRevenue.toLocaleString()}`} accent="positive" />
        <MetricCard icon={Target} label="ROAS" value={`${metrics.totalROAS}x`} accent="positive" />
        <MetricCard icon={PhoneCall} label="Calls Booked" value={metrics.callsBooked.toString()} />
        <MetricCard icon={Users} label="Clients Won" value={metrics.clientCount.toString()} accent="positive" />
        <MetricCard icon={Repeat} label="Recurring Rev." value={`$${metrics.recurringRevenue.toLocaleString()}`} />
      </div>

      {/* Closer Performance */}
      <div className="grid lg:grid-cols-2 gap-6" style={{ animationDelay: "100ms" }}>
        <div className="card-dashboard p-6 animate-slide-up" style={{ animationDelay: "120ms" }}>
          <h3 className="section-header mb-4">Revenue by Closer</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={closers} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
              <Bar dataKey="revenue" fill="hsl(160 84% 39%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-dashboard p-6 animate-slide-up" style={{ animationDelay: "180ms" }}>
          <h3 className="section-header mb-4">Spend by Product</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={spendByProduct} barSize={36} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }} width={110} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Spent"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
              <Bar dataKey="value" fill="hsl(210 100% 56%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Closer Table */}
      <div className="card-dashboard overflow-hidden animate-slide-up" style={{ animationDelay: "240ms" }}>
        <div className="p-6 pb-0"><h3 className="section-header">Closer Performance</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Closer", "Calls", "Show-Up", "Clients", "Spent", "Revenue", "ROAS", "Conv %", "Avg Ticket", "Avg Cycle"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {closers.map((c) => (
                <tr key={c.name} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-3.5 font-medium">{c.name}</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums">{c.completed}</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums">{c.showUp}</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums">{c.clients}</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums">${c.spent.toLocaleString()}</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums text-metric-positive">${c.revenue.toLocaleString()}</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums">{c.roas}x</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums">{c.convRate}%</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums">${c.avgTicket.toLocaleString()}</td>
                  <td className="px-6 py-3.5 font-mono text-sm tabular-nums">{c.avgSalesCycle}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Approval Trend */}
      <div className="card-dashboard p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <h3 className="section-header mb-4">Weekly Lead Approval Rate</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip formatter={(value: number) => [`${value}%`, "Approval Rate"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
            <Line type="monotone" dataKey="rate" stroke="hsl(160 84% 39%)" strokeWidth={2.5} dot={{ fill: "hsl(160 84% 39%)", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
