import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function htmlResponse(status: number, title: string, message: string) {
  const body = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,-apple-system,sans-serif;background:#0b0b0c;color:#e7e7ea;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}h1{font-size:22px;margin:0 0 8px}p{color:#9aa0a6;font-size:14px;margin:0}</style></head><body><div><h1>${title}</h1><p>${message}</p></div></body></html>`;
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    // Path examples: /r/abc123 or /functions/v1/r/abc123
    const parts = url.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1];

    if (!slug || slug === "r") {
      return htmlResponse(404, "Link não encontrado", "Verifique o endereço e tente novamente.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.rpc("resolve_referral_slug", { _slug: slug });

    if (error) {
      console.error("resolve_referral_slug error", error);
      return htmlResponse(500, "Erro", "Não foi possível processar o link.");
    }
    if (!data || data.length === 0) {
      return htmlResponse(404, "Link não encontrado", "Verifique o endereço e tente novamente.");
    }
    const row = data[0] as { url: string; is_active: boolean };
    if (!row.is_active) {
      return htmlResponse(410, "Link desativado", "Este link de indicação não está mais ativo.");
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: row.url,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return htmlResponse(500, "Erro", "Não foi possível processar o link.");
  }
});
