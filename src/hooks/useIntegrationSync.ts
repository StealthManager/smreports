import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useIntegrationSync() {
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  const syncGHL = async (locationId: string = "jsauqaKSnuB5fJ4pt5JG", pipelineId: string = "uP4c8hW4lt1AhQbW2DS5") => {
    setSyncing((s) => ({ ...s, GoHighLevel: true }));
    try {
      const { data, error } = await supabase.functions.invoke("ghl-sync", {
        body: { locationId, pipelineId },
      });
      if (error) throw error;
      toast({
        title: "GoHighLevel Sync Complete",
        description: `${data.leadsUpserted} leads synced, ${data.errors || 0} errors`,
      });
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      toast({ title: "GHL Sync Error", description: msg, variant: "destructive" });
      throw err;
    } finally {
      setSyncing((s) => ({ ...s, GoHighLevel: false }));
    }
  };

  const syncMeta = async (datePreset?: string, month?: string) => {
    setSyncing((s) => ({ ...s, "Meta Ads": true }));
    try {
      const { data, error } = await supabase.functions.invoke("meta-ads-sync", {
        body: { datePreset, month },
      });
      if (error) throw error;
      toast({
        title: "Meta Ads Sync Complete",
        description: `${data.campaignsProcessed} campaigns, $${data.totalSpend?.toFixed(2)} total spend`,
      });
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      toast({ title: "Meta Ads Sync Error", description: msg, variant: "destructive" });
      throw err;
    } finally {
      setSyncing((s) => ({ ...s, "Meta Ads": false }));
    }
  };

  return { syncing, syncGHL, syncMeta };
}
