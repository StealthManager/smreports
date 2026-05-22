import { useEffect, useMemo, useState } from "react";
import { Copy, Trash2, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Destination = "landing" | "calendar";

interface ReferralLink {
  id: string;
  contact_name: string;
  destination: string;
  url: string;
  short_slug: string;
  is_active: boolean;
  click_count: number;
  created_at: string;
}

const BASE_URLS: Record<Destination, string> = {
  landing: "https://go.stealthmanager.com",
  calendar: "https://api.leadconnectorhq.com/widget/bookings/stealth-discoverycall",
};

const CAMPAIGN = "rpgv1";
const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function randomSlug(len = 6) {
  let s = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) s += SLUG_ALPHABET[arr[i] % SLUG_ALPHABET.length];
  return s;
}

export function ReferralCodeSection() {
  const [contactName, setContactName] = useState("");
  const [destination, setDestination] = useState<Destination>("landing");
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(false);

  const slug = slugify(contactName);
  const shortOrigin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );
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
    setLinks((data ?? []) as ReferralLink[]);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const shortUrlFor = (s: string) => `${shortOrigin}/r/${s}`;

  const handleGenerate = async () => {
    if (!slug) {
      toast.error("Insira o nome do cliente ou contato");
      return;
    }
    setLoading(true);
    const url = `${BASE_URLS[destination]}?utm_source=${slug}&utm_campaign=${CAMPAIGN}&utm_medium=${slug}`;
    // Try a few times in the unlikely event of a slug collision
    let inserted = false;
    let attempts = 0;
    let newSlug = "";
    while (!inserted && attempts < 5) {
      newSlug = randomSlug(6);
      const { error } = await supabase.from("referral_links").insert({
        contact_name: contactName.trim(),
        destination,
        url,
        utm_source: slug,
        utm_medium: slug,
        utm_campaign: CAMPAIGN,
        short_slug: newSlug,
      });
      if (!error) {
        inserted = true;
      } else if (!error.message?.toLowerCase().includes("duplicate")) {
        setLoading(false);
        toast.error("Erro ao salvar link");
        return;
      }
      attempts++;
    }
    setLoading(false);
    if (!inserted) {
      toast.error("Não foi possível gerar um slug único");
      return;
    }
    toast.success("Link gerado e link curto copiado");
    try {
      await navigator.clipboard.writeText(shortUrlFor(newSlug));
    } catch {}
    setContactName("");
    fetchLinks();
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copiado");
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleToggleActive = async (link: ReferralLink, next: boolean) => {
    setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, is_active: next } : l)));
    const { error } = await supabase
      .from("referral_links")
      .update({ is_active: next })
      .eq("id", link.id);
    if (error) {
      toast.error("Erro ao atualizar status");
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, is_active: !next } : l)));
      return;
    }
    toast.success(next ? "Link ativado" : "Link desativado");
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
          Gere links de indicação com UTMs padronizadas e um link curto que você pode desativar a qualquer momento.
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contato</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Link original</TableHead>
                  <TableHead>Link encurtado</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => {
                  const shortUrl = shortUrlFor(link.short_slug);
                  return (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium align-top">
                        <div>{link.contact_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(link.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {link.destination === "landing" ? "Landing" : "Calendário"}
                        </span>
                      </TableCell>
                      <TableCell className="align-top max-w-xs">
                        <div className="flex items-start gap-1">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-mono break-all text-primary hover:underline"
                          >
                            {link.url}
                          </a>
                          <Button size="icon" variant="ghost" onClick={() => handleCopy(link.url)}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-start gap-1">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-mono break-all text-primary hover:underline"
                          >
                            {shortUrl}
                          </a>
                          <Button size="icon" variant="ghost" onClick={() => handleCopy(shortUrl)}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top tabular-nums">
                        {link.click_count}
                      </TableCell>
                      <TableCell className="align-top">
                        <Switch
                          checked={link.is_active}
                          onCheckedChange={(v) => handleToggleActive(link, v)}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(link.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
