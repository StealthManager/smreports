

# Integração GoHighLevel CRM + Meta Ads

## Visão Geral

Criar duas edge functions (backend functions) que conectam com as APIs do GoHighLevel e Meta Ads, puxando dados em tempo real para o banco de dados. O dashboard passará a ler dados reais em vez de dados estáticos.

## Etapa 1 — Armazenar o token do GoHighLevel como secret

Usar a ferramenta `add_secret` para salvar o token GHL (`pit-7205f575-...`) de forma segura no backend. Será acessível apenas pelas edge functions.

## Etapa 2 — Edge Function: `ghl-sync`

Criar `supabase/functions/ghl-sync/index.ts` que:
- Usa a API v2 do GoHighLevel (`https://services.leadconnectorhq.com/`)
- Autentica com o token privado via header `Authorization: Bearer {token}`
- Busca contatos/oportunidades (leads) do CRM
- Mapeia os dados para a tabela `leads` (nome, pipeline_stage, deal_size, source, closer, etc.)
- Faz upsert no banco usando `ghl_contact_id` como chave de deduplicação
- Retorna um resumo da sincronização

**Endpoints GHL utilizados:**
- `GET /contacts/` — lista contatos com paginação
- `GET /opportunities/` — lista oportunidades do pipeline
- `GET /calendars/events` — chamadas agendadas (calls booked)

## Etapa 3 — Configurar Meta Ads

Para Meta Ads, será necessário um **Access Token** da API do Facebook Marketing. Vou solicitar que você forneça:
- O **Access Token** (gerado no Facebook Business Manager ou via app)
- O **Ad Account ID** (formato `act_XXXXXXXXX`)

## Etapa 4 — Edge Function: `meta-ads-sync`

Criar `supabase/functions/meta-ads-sync/index.ts` que:
- Usa a API Graph do Facebook (`https://graph.facebook.com/v21.0/`)
- Busca campanhas, ad sets e ads com métricas (spend, impressions, clicks, leads)
- Mapeia para as tabelas `ad_spend` e `utm_performance`
- Atualiza métricas de custo por canal no banco

## Etapa 5 — Atualizar o Frontend

- Modificar `IntegrationsSection` para chamar as edge functions de sync via botão "Sync Now"
- Atualizar `OverviewSection`, `LeadQualitySection` e `AdPerformanceSection` para ler dados do banco (queries ao Supabase) em vez do arquivo estático `dashboard-data.ts`
- Mostrar status da última sincronização e contagem de leads importados

## Etapa 6 — Sync automático (opcional)

Criar um cron job com `pg_cron` para rodar a sincronização a cada hora automaticamente.

---

## Próximo passo imediato

Antes de implementar, preciso confirmar sobre o **Meta Ads**: você já tem o Access Token da API do Facebook Marketing e o Ad Account ID? Sem isso, posso começar pela integração do GoHighLevel primeiro.

