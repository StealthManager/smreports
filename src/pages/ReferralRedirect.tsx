import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ReferralRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<"loading" | "inactive" | "notfound">("loading");

  useEffect(() => {
    if (!slug) {
      setStatus("notfound");
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("resolve_referral_slug", { _slug: slug });
      if (error || !data || data.length === 0) {
        setStatus("notfound");
        return;
      }
      const row = data[0] as { url: string; is_active: boolean };
      if (!row.is_active) {
        setStatus("inactive");
        return;
      }
      window.location.replace(row.url);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md text-center space-y-2">
        {status === "loading" && <p className="text-sm text-muted-foreground">Redirecionando...</p>}
        {status === "inactive" && (
          <>
            <h1 className="text-2xl font-semibold">Link desativado</h1>
            <p className="text-sm text-muted-foreground">Este link de indicação não está mais ativo.</p>
          </>
        )}
        {status === "notfound" && (
          <>
            <h1 className="text-2xl font-semibold">Link não encontrado</h1>
            <p className="text-sm text-muted-foreground">Verifique o endereço e tente novamente.</p>
          </>
        )}
      </div>
    </div>
  );
}
