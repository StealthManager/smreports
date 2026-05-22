import { useEffect, useState } from "react";
import { Copy, Trash2, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Destination = "landing" | "calendar";

interface ReferralLink {
  id: string;
  contact_name: string;
  destination: string;
  url: string;
  created_at: string;
}

const BASE_URLS: Record<Destination, string> = {
  landing: "https://go.stealthmanager.com",
  calendar: "https://api.leadconnectorhq.com/widget/bookings/stealth-discoverycall",
};

const CAMPAIGN = "rpgv1";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function ReferralCodeSection() {
  const [contactName, setContactName] = useState("");
  const [destination, setDestination] = useState<Destination>("landing");
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(false);

  const slug = slugify(contactName);
  const preview = slug
    ? `${BASE_URLS[destination]}?utm_source=${slug}&utm_campaign=${CAMPAIGN}&utm_medium=${slug}`
    : "";

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("referral_links")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar links");
      return;
    }
    setLinks(data ?? []);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleGenerate = async () => {
    if (!slug) {
      toast.error("Insira o nome do cliente ou contato");
      return;
    }
    setLoading(true);
    const url = `${BASE_URLS[destination]}?utm_source=${slug}&utm_campaign=${CAMPAIGN}&utm_medium=${slug}`;
    const { error } = await supabase.from("referral_links").insert({
      contact_name: contactName.trim(),
      destination,
      url,
      utm_source: slug,
      utm_medium: slug,
      utm_campaign: CAMPAIGN,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao salvar link");
      return;
    }
    toast.success("Link gerado e copiado");
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    setContactName("");
    fetchLinks();
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("referral_links").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
      return;
    }
    toast.success("Link excluído");
    fetchLinks();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Referral Code</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gere e armazene links de indicação com UTMs padronizadas.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="contact">Nome do cliente ou contato</Label>
          <Input
            id="contact"
            placeholder="ex: Scale Logic"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Preenche automaticamente <code>utm_source</code> e <code>utm_medium</code>.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Destino</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={destination === "landing" ? "default" : "outline"}
              onClick={() => setDestination("landing")}
            >
              Landing Page
            </Button>
            <Button
              type="button"
              variant={destination === "calendar" ? "default" : "outline"}
              onClick={() => setDestination("calendar")}
            >
              Calendário
            </Button>
          </div>
        </div>

        {preview && (
          <div className="rounded-md bg-muted p-3 text-xs font-mono break-all text-muted-foreground">
            {preview}
          </div>
        )}

        <Button onClick={handleGenerate} disabled={loading || !slug}>
          <LinkIcon className="w-4 h-4 mr-2" />
          Gerar link
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Links gerados</h2>
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum link gerado ainda.</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-start gap-3 p-3 rounded-md border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{link.contact_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {link.destination === "landing" ? "Landing Page" : "Calendário"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono break-all text-primary hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => handleCopy(link.url)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(link.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
