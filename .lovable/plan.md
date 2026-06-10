## Plano: Link de afiliado com redirect server-side (HTTP 302)

### Por que a versão atual pediu login
O link curto hoje aponta para a rota `/r/:slug` dentro do SPA. Quando aberto na **preview URL** (`id-preview--...lovable.app`), o Lovable exige login do workspace — por isso o afiliado caiu numa tela de login. No domínio publicado (`smreports.lovable.app`) isso não acontece, mas mesmo lá o redirect é client-side (carrega o app inteiro só pra redirecionar) e bots de preview de link (WhatsApp, iMessage, Slack) podem não seguir.

A solução robusta para afiliados é um **redirect HTTP 302 real, server-side**, via Edge Function pública. Não carrega SPA, não passa por nenhuma camada de auth, funciona em qualquer cliente/bot.

### Como vai funcionar

1. Nova Edge Function pública `r` em `supabase/functions/r/index.ts`.
2. URL do link curto passa a ser:
   ```
   https://vzarywoajkqhziabgoas.supabase.co/functions/v1/r/{slug}
   ```
3. Ao ser acessada, a função:
   - Lê o `slug` do path.
   - Chama `resolve_referral_slug` (já existe, é `SECURITY DEFINER` e incrementa `click_count`).
   - Se ativo → retorna `302` com header `Location: <url original com UTMs>`.
   - Se inativo → retorna `410 Gone` com HTML curto "Link desativado".
   - Se não encontrado → `404` com HTML "Link não encontrado".
4. `ReferralCodeSection.tsx` passa a montar o link curto usando essa URL da função (não mais `window.location.origin`).
5. A rota SPA `/r/:slug` e o arquivo `src/pages/ReferralRedirect.tsx` são removidos (não são mais necessários).

### Mudanças técnicas

- **Edge Function `r`** (`verify_jwt = false`, configurada via `supabase/config.toml`):
  - Usa `SUPABASE_URL` + `SUPABASE_ANON_KEY` (já são secrets do projeto).
  - Sem CORS (é navegação direta, não fetch).
  - Suporta path com slug: `/r/aB3xK9`.
- **`ReferralCodeSection.tsx`**: substituir `shortUrlFor()` para apontar para `https://<project-ref>.supabase.co/functions/v1/r/{slug}`. O project ref vem de `import.meta.env.VITE_SUPABASE_PROJECT_ID`.
- **Limpeza**: remover `src/pages/ReferralRedirect.tsx` e a rota `/r/:slug` em `src/App.tsx`.
- **RPC**: `resolve_referral_slug` continua igual — já incrementa cliques e respeita `is_active`.

### Observações

- O link fica no formato `....supabase.co/functions/v1/r/abc123` — mais longo que `smreports.lovable.app/r/abc123`, mas é o trade-off para ter 302 real. Se você quiser um link bonito tipo `stlth.link/abc123` depois, dá pra apontar um custom domain CNAME para a função sem mudar código de novo.
- O botão "Desativar" continua funcionando: a função devolve 410 imediatamente e o afiliado vê "Link desativado".
- Contador de cliques continua incrementando via a mesma RPC.
