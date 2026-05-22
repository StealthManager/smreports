## Plano: Encurtador de links próprio para os Referral Codes

Vamos criar um encurtador interno (estilo bit.ly) hospedado no próprio backend, com slug curto, possibilidade de **ativar/desativar** cada link e contagem de cliques. Sem dependência de serviço externo.

### Como vai funcionar

1. Ao gerar um referral, além do link completo com UTMs (original), o sistema cria um **slug curto** (ex: `aB3xK9`) e salva.
2. O link curto fica no formato:
   ```
   https://smreports.lovable.app/r/aB3xK9
   ```
   (usa o domínio publicado do dashboard — sem custo extra de domínio)
3. Quando alguém acessa `/r/aB3xK9`, uma página leve faz lookup no banco:
   - Se **ativo** → redireciona (HTTP 302) para a URL original (com todas as UTMs preservadas) e incrementa o contador de cliques.
   - Se **desativado** → mostra "Este link foi desativado".
4. Na aba de links gerados, **duas colunas**: Link original (longo, com UTMs) e Link encurtado, cada um com botão de copiar. Mais um **toggle Ativo/Inativo** e contador de cliques.

### Mudanças técnicas

**Banco (`referral_links`):**
- Adicionar colunas: `short_slug text unique`, `is_active boolean default true`, `click_count int default 0`, `last_clicked_at timestamptz`.
- Backfill: gerar slugs para os links existentes.
- Permitir UPDATE na tabela (hoje só tem insert/select/delete) para o toggle e o incremento.

**Frontend:**
- Nova rota `/r/:slug` → componente `ReferralRedirect.tsx` que busca o slug, incrementa cliques via RPC e faz `window.location.replace(url)`.
- `ReferralCodeSection.tsx`: gerar slug aleatório no insert; trocar a lista por uma **tabela** com colunas: Contato | Destino | Link original | Link encurtado | Cliques | Status (toggle) | Ações (copiar/excluir).

**Domínio do link curto:**
- Por padrão usa `window.location.origin` (ou seja, `https://smreports.lovable.app/r/...`).
- Se no futuro quiser um domínio ainda mais curto (ex: `stlth.link`), basta conectar um custom domain ao projeto — o código não muda.

### Pontos de atenção

- O redirecionamento é client-side (SPA), então há ~200ms de "tela em branco" antes do redirect. Para uso em campanha de indicação isso é aceitável; bots de preview de link (WhatsApp, etc.) podem não seguir o redirect — me avise se isso for crítico que eu troco por um redirect via Edge Function (HTTP 302 real, server-side).
- Slug de 6 caracteres alfanuméricos = ~56 bilhões de combinações, colisão praticamente nula.
