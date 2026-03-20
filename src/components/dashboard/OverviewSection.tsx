import { overviewMetrics, closerPerformance, weeklyApproval } from "@/data/dashboard-data";
import { MetricCard } from "./MetricCard";
import { DollarSign, Users, PhoneCall, TrendingUp, Target, Repeat } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

export function OverviewSection() {
  const spendByProduct = Object.entries(overviewMetrics.totalSpentByProduct)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 16) + "…" : name, value }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">{overviewMetrics.month} — Stealth Agency Performance</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-slide-up">
        <MetricCard icon={DollarSign} label="Total Spent" value={`$${overviewMetrics.totalSpent.toLocaleString()}`} />
        <MetricCard icon={TrendingUp} label="New Revenue" value={`$${overviewMetrics.newRevenue.toLocaleString()}`} accent="positive" />
        <MetricCard icon={Target} label="ROAS" value={`${overviewMetrics.totalROAS}x`} accent="positive" />
        <MetricCard icon={PhoneCall} label="Calls Booked" value={overviewMetrics.callsBooked.toString()} />
        <MetricCard icon={Users} label="Clients Won" value={overviewMetrics.clientCount.toString()} accent="positive" />
        <MetricCard icon={Repeat} label="Recurring Rev." value={`$${overviewMetrics.recurringRevenue.toLocaleString()}`} />
      </div>

      {/* Closer Performance */}
      <div className="grid lg:grid-cols-2 gap-6" style={{ animationDelay: "100ms" }}>
        <div className="card-dashboard p-6 animate-slide-up" style={{ animationDelay: "120ms" }}>
          <h3 className="section-header mb-4">Revenue by Closer</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={closerPerformance} barSize={36}>
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
              {closerPerformance.map((c) => (
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
          <LineChart data={weeklyApproval}>
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
