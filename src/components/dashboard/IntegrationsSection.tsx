import { integrations } from "@/data/dashboard-data";
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusConfig = {
  connected: { icon: CheckCircle2, label: "Connected", color: "text-metric-positive", bg: "bg-primary/10" },
  needs_attention: { icon: AlertTriangle, label: "Needs Attention", color: "text-warning", bg: "bg-warning/10" },
  disconnected: { icon: AlertTriangle, label: "Disconnected", color: "text-destructive", bg: "bg-destructive/10" },
};

const integrationLogos: Record<string, string> = {
  GoHighLevel: "GHL",
  "Meta Ads": "META",
  "Google Ads": "G",
};

export function IntegrationsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">Connect GoHighLevel CRM, Meta Ads, and Google Ads to auto-capture data</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((int, i) => {
          const status = statusConfig[int.status];
          const StatusIcon = status.icon;
          return (
            <div
              key={int.name}
              className="card-dashboard p-6 flex flex-col gap-4 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-foreground">
                  {integrationLogos[int.name]}
                </div>
                <div>
                  <p className="font-semibold">{int.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/50">
                <div>
                  <p className="metric-label">Last Sync</p>
                  <p className="text-sm font-medium mt-0.5">{int.lastSync}</p>
                </div>
                <div>
                  <p className="metric-label">Leads Imported</p>
                  <p className="text-sm font-mono tabular-nums font-medium mt-0.5">{int.leadsImported}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Now
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground">
                  Settings
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Future integrations hint */}
      <div className="card-dashboard p-6 border-dashed border-2 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <p className="text-sm font-medium text-muted-foreground text-center">
          More integrations coming soon — TikTok Ads, LinkedIn Ads, and custom webhook connectors
        </p>
      </div>
    </div>
  );
}
