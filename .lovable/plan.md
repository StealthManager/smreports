
# Plano: Prompt de exportação para Claude Code

## O que será entregue

Um arquivo Markdown único — `export-prompt-stealth-features.md` — em `/mnt/documents/`, pronto para colar no Claude Code (VS Code). O prompt contém **código completo** (SQL + Edge Function + componentes TSX + hooks) das três features, com tokens neutros (`bg-card`, `text-foreground`, `text-muted-foreground`, etc. — sem cores hardcoded do Stealth).

Também emitirei a tag `<presentation-artifact>` para o usuário baixar o arquivo direto do chat.

## Escopo do prompt

### 1. Material Approval
- Tabela `materials` (status: pending/approved/rejected, type: image/text/video, file_url, channel, etc.)
- Bucket público `materials` no Supabase Storage
- Enums `material_status` e `material_type`
- Componente `MaterialApprovalSection.tsx` (filtro all/pending/approved/rejected + grid de cards + ações approve/reject)
- Trigger `updated_at`
- RLS: leitura pública, escrita autenticada (configurável)

### 2. Referral Code (links de afiliado)
- Tabelas `referral_links` (slug, contact_name, destination, url, utms, click_count, is_active) e `referral_clicks` (log com user_agent/referer/clicked_at)
- Função RPC `resolve_referral_slug(_slug, _user_agent, _referer)` SECURITY DEFINER — incrementa contador, registra clique, retorna URL+status
- Edge Function `r/index.ts` — HTTP 302 real, 404 / 410 / 500 com fallback HTML
- Componente `ReferralCodeSection.tsx` (gera UTMs, slug curto de 6 chars, copia link, ativa/desativa, exclui, modal de histórico de cliques)
- Config `verify_jwt = false` para a função `r`

### 3. Recurring Revenue (3 partes)
- **Tabela + CRUD**: `recurring_revenue_tags` + hook `useRecurringTags` + componente `RecurringTagsManager.tsx`
- **Lógica de categorização**: trecho de código que separa receita em `recurringRevenue` (leads ganhos cujas tags intersectam com `recurring_revenue_tags`) vs `oneTimeRevenue` (resto), incluindo a fórmula `revenue || deal_size`
- **Integração com leads/GHL**: hook auxiliar `useAllLeadTags` (extrai tags distintas da tabela `leads`) + nota explicando que o sync GHL precisa popular `leads.tags` como `text[]` para a lógica funcionar. Inclui contrato mínimo da tabela `leads` (apenas colunas exigidas: `id`, `pipeline_stage`, `revenue`, `deal_size`, `tags`).

## Estrutura do prompt gerado

O Markdown será organizado para o Claude Code executar passo a passo:

```text
1. Contexto e stack (React+Vite+TS+Tailwind+shadcn+Supabase)
2. Pré-requisitos (shadcn components: button, card, input, label, switch, table, dialog, badge; sonner; lucide-react)
3. Migration SQL única (todas as tabelas, enums, RLS, GRANTs, funções, triggers, bucket)
4. Edge Function r/ (código completo + config.toml snippet)
5. Frontend:
   - src/integrations/supabase/client.ts (referência ao padrão existente)
   - src/hooks/useRecurringTags.ts
   - src/hooks/useAllLeadTags.ts
   - src/components/dashboard/MaterialApprovalSection.tsx
   - src/components/dashboard/ReferralCodeSection.tsx
   - src/components/dashboard/RecurringTagsManager.tsx
   - Trecho de cálculo de recurring revenue (para colar em um hook de overview)
6. Variáveis de ambiente necessárias (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID)
7. Checklist de validação (gerar link, clicar, ver contador subir; aprovar material; adicionar tag e ver MRR mudar)
```

## Ajustes de neutralização

- Remover URLs hardcoded do Stealth (`go.stealthmanager.com`, calendário LeadConnector) → substituídas por `DESTINATION_LANDING` e `DESTINATION_CALENDAR` que o usuário configura no topo do componente.
- Trocar `CAMPAIGN = "rpgv1"` por constante editável.
- Trocar título "Stealth" por placeholders neutros.
- Sem alterações em paleta — componentes já usam tokens semânticos (`bg-muted`, `text-foreground`).

## Detalhes técnicos

- **Não vou criar nem migrar nada no projeto atual.** Só leio e gero um artefato externo.
- O prompt instrui o Claude Code a usar a CLI do Supabase (`supabase migration new`, `supabase functions deploy r --no-verify-jwt`) já que ele não está em ambiente Lovable.
- Inclui nota sobre rodar `npx shadcn@latest add ...` para componentes faltantes.
- Tamanho estimado: ~25–35 KB de Markdown.

## Próximo passo

Após aprovação, em build mode eu:
1. Escrevo `/mnt/documents/export-prompt-stealth-features.md` com o conteúdo completo.
2. Emito `<presentation-artifact>` para download.
