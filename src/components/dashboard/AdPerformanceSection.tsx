import { useState, useMemo } from "react";
import { useAdPerformanceData, type UtmRow } from "@/hooks/useAdPerformanceData";
import { utmPerformance as staticUtm } from "@/data/dashboard-data";
import { DateRangeFilter, getDefaultRange, type DateRange } from "./DateRangeFilter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Loader2, ChevronRight, ChevronDown } from "lucide-react";

export function AdPerformanceSection() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());
  const { data: liveData, loading } = useAdPerformanceData(dateRange);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [expandedAdsets, setExpandedAdsets] = useState<Set<string>>(new Set());

  const source = liveData.length > 0
    ? liveData
    : staticUtm.map((d) => ({ ...d, spend: 0, level: "ad" as const, campaignName: null, adsetName: null }));
  const isLive = liveData.length > 0;

  // Build hierarchy
  const hierarchy = useMemo(() => {
    const campaigns = source.filter((r) => r.level === "campaign").sort((a, b) => b.spend - a.spend);
    const adsets = source.filter((r) => r.level === "adset");
    const ads = source.filter((r) => r.level === "ad");

    return campaigns.map((campaign) => ({
      ...campaign,
      adsets: adsets
        .filter((as) => as.campaignName === campaign.utm)
        .sort((a, b) => b.spend - a.spend)
        .map((adset) => ({
          ...adset,
          ads: ads
            .filter((ad) => ad.campaignName === campaign.utm && ad.adsetName === adset.utm)
            .sort((a, b) => b.spend - a.spend),
        })),
    }));
  }, [source]);

  // Compute average CPA across all data for quality score normalization
  const avgCPA = useMemo(() => {
    const withResults = source.filter((r) => r.totalLeads > 0 && r.spend > 0);
    if (withResults.length === 0) return 0;
    const totalSpend = withResults.reduce((s, r) => s + r.spend, 0);
    const totalResults = withResults.reduce((s, r) => s + r.totalLeads, 0);
    return totalResults > 0 ? totalSpend / totalResults : 0;
  }, [source]);

  function qualityScore(row: UtmRow) {
    // Weights: CPA=2, Hot%=3, Won%=5 → total 10
    const cpa = row.totalLeads > 0 ? row.spend / row.totalLeads : Infinity;
    // CPA score: if avgCPA is 0, skip. Lower CPA = higher score. Cap at 100.
    let cpaScore = 0;
    if (avgCPA > 0 && cpa !== Infinity) {
      cpaScore = Math.min(100, Math.max(0, (avgCPA / cpa) * 100));
    }
    return (cpaScore * 2 + row.hotRate * 3 + row.wonRate * 5) / 10;
  }

  const toggleCampaign = (name: string) => {
    setExpandedCampaigns((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleAdset = (key: string) => {
    setExpandedAdsets((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Chart data from campaigns only
  const chartData = hierarchy.slice(0, 10).map((d) => ({
    name: d.utm.length > 35 ? d.utm.slice(0, 35) + "…" : d.utm,
    spend: d.spend,
    results: d.totalLeads,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const headers = ["Ad / UTM", "Spend", "Results", "CPA", "% Hot Leads", "% Won", "Quality Score"];

  function renderRow(row: UtmRow, indent: number, key: string, expandable?: boolean, expanded?: boolean, onToggle?: () => void, childCount?: number) {
    const qs = qualityScore(row);
    const cpa = row.totalLeads > 0 ? row.spend / row.totalLeads : 0;
    const levelColors: Record<string, string> = {
      campaign: "bg-primary/10 text-primary",
      adset: "bg-accent/60 text-accent-foreground",
      ad: "",
    };
    const levelLabel: Record<string, string> = {
      campaign: "Campaign",
      adset: "Adset",
      ad: "Ad",
    };

    return (
      <tr key={key} className={`border-b border-border/50 hover:bg-muted/40 transition-colors ${row.level === "campaign" ? "bg-muted/20 font-semibold" : ""}`}>
        <td className="px-6 py-3.5 max-w-xs">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indent * 20}px` }}>
            {expandable ? (
              <button onClick={onToggle} className="p-0.5 hover:bg-muted rounded">
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${levelColors[row.level]}`}>
              {levelLabel[row.level]}
            </span>
            <span className="truncate">{row.utm}</span>
            {expandable && childCount !== undefined && (
              <span className="text-xs text-muted-foreground ml-1">({childCount})</span>
            )}
          </div>
        </td>
        <td className="px-6 py-3.5 font-mono tabular-nums">${row.spend.toLocaleString()}</td>
        <td className="px-6 py-3.5 font-mono tabular-nums">{row.totalLeads}</td>
        <td className="px-6 py-3.5 font-mono tabular-nums">{cpa > 0 ? `$${cpa.toFixed(2)}` : "—"}</td>
        <td className="px-6 py-3.5 font-mono tabular-nums">{row.hotRate.toFixed(1)}%</td>
        <td className="px-6 py-3.5 font-mono tabular-nums text-metric-positive">{row.wonRate.toFixed(1)}%</td>
        <td className="px-6 py-3.5">
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(qs, 100)}%` }} />
            </div>
            <span className="text-xs font-mono tabular-nums text-muted-foreground">{qs.toFixed(1)}</span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Performance & UTM Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Campaign → Adset → Ad hierarchy with spend and conversion quality
            {!isLive && <span className="ml-2 text-xs text-warning">(sample data)</span>}
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Spend by Campaign Chart */}
      <div className="card-dashboard p-6 animate-slide-up">
        <h3 className="section-header mb-4">Spend by Campaign</h3>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} barSize={28} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(220 10% 46%)" }} width={220} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "spend" ? `$${value.toLocaleString()}` : value,
                name === "spend" ? "Spend" : "Results",
              ]}
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }}
            />
            <Bar dataKey="spend" fill="hsl(210 100% 56%)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hierarchical Table */}
      <div className="card-dashboard overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="p-6 pb-0"><h3 className="section-header">Campaign Performance Detail</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {headers.map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hierarchy.map((campaign) => {
                const campaignExpanded = expandedCampaigns.has(campaign.utm);
                const rows = [];

                rows.push(renderRow(campaign, 0, `c-${campaign.utm}`, true, campaignExpanded, () => toggleCampaign(campaign.utm), campaign.adsets.length));

                if (campaignExpanded) {
                  for (const adset of campaign.adsets) {
                    const adsetKey = `${campaign.utm}::${adset.utm}`;
                    const adsetExpanded = expandedAdsets.has(adsetKey);

                    rows.push(renderRow(adset, 1, `as-${adsetKey}`, adset.ads.length > 0, adsetExpanded, () => toggleAdset(adsetKey), adset.ads.length));

                    if (adsetExpanded) {
                      for (const ad of adset.ads) {
                        rows.push(renderRow(ad, 2, `ad-${adsetKey}::${ad.utm}`, false));
                      }
                    }
                  }
                }

                return rows;
              })}
              {hierarchy.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No data available for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
