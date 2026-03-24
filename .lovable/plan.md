

# Configurar Meta Ads — Salvar Secrets e Finalizar Integração

## O que temos
- **Access Token**: fornecido pelo usuário (permissão `ads_read`)
- **App ID**: `1261722298743185` (fornecido anteriormente)
- **App Secret**: `91fefb1e11a0bf96eef88c2f899a5dad` (fornecido anteriormente)
- **Ad Account ID**: ainda pendente — preciso que o usuário forneça

## O que será feito

### 1. Salvar secrets no backend
Usar a ferramenta `add_secret` para armazenar:
- `META_ADS_TOKEN` — o Access Token fornecido
- `META_AD_ACCOUNT_ID` — o Ad Account ID (quando fornecido)

O App ID e App Secret podem ser usados futuramente para renovar tokens de longa duração, mas não são necessários para a sync inicial.

### 2. Edge function `meta-ads-sync` — já pronta
A edge function já existe em `supabase/functions/meta-ads-sync/index.ts` e espera exatamente esses dois secrets (`META_ADS_TOKEN` e `META_AD_ACCOUNT_ID`). Não precisa de alteração no código.

### 3. Testar a sincronização
Após salvar os secrets e receber o Ad Account ID:
- Re-deploy da edge function
- Testar via botão "Sync Now" na seção Integrations do dashboard

## Pendência
Preciso do **Ad Account ID** (`act_XXXXXXXXX`) para prosseguir com a configuração completa.

