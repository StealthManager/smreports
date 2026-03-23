import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIntegrationSync } from "@/hooks/useIntegrationSync";
import { CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
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

interface Integration {
  id: string;
  name: string;
  status: string;
  last_sync_at: string | null;
  leads_imported: number | null;
}

export function IntegrationsSection() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { syncing, syncGHL, syncMeta } = useIntegrationSync();

  const fetchIntegrations = async () => {
    const { data } = await supabase.from("integrations").select("*");
    if (data) setIntegrations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSync = async (name: string) => {
    try {
      if (name === "GoHighLevel") await syncGHL();
      else if (name === "Meta Ads") await syncMeta();
      // Refresh after sync
      await fetchIntegrations();
    } catch {
      // error already toasted
    }
  };

  const formatLastSync = (ts: string | null) => {
    if (!ts) return "Never";
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

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
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">Connect GoHighLevel CRM, Meta Ads, and Google Ads to auto-capture data</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((int, i) => {
          const statusKey = (int.status as keyof typeof statusConfig) || "disconnected";
          const status = statusConfig[statusKey] || statusConfig.disconnected;
          const StatusIcon = status.icon;
          const isSyncing = syncing[int.name] || false;

          return (
            <div
              key={int.name}
              className="card-dashboard p-6 flex flex-col gap-4 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-foreground">
                  {integrationLogos[int.name] || int.name.charAt(0)}
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
                  <p className="text-sm font-medium mt-0.5">{formatLastSync(int.last_sync_at)}</p>
                </div>
                <div>
                  <p className="metric-label">Leads Imported</p>
                  <p className="text-sm font-mono tabular-nums font-medium mt-0.5">{int.leads_imported || 0}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5"
                  disabled={isSyncing || int.name === "Google Ads"}
                  onClick={() => handleSync(int.name)}
                >
                  {isSyncing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {isSyncing ? "Syncing…" : "Sync Now"}
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground">
                  Settings
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-dashboard p-6 border-dashed border-2 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <p className="text-sm font-medium text-muted-foreground text-center">
          More integrations coming soon — TikTok Ads, LinkedIn Ads, and custom webhook connectors
        </p>
      </div>
    </div>
  );
}
