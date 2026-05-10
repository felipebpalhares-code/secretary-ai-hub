# Pendências de integração — features desabilitadas

Cada feature aqui está **desabilitada via flag** porque ainda não tem
fonte de dados real plugada. Reativar é só virar a flag pra `true` no
`.env` (ou ajustar default em `core/features.py` / `frontend/lib/features.ts`).

Telas com flag `false` somem da Sidebar e os endpoints relacionados
respondem `503 Not Implemented` com `Retry-After`. O código continua
no repositório — só não é exposto.

## Convenção de naming

- Backend: `FEATURE_<AREA>_ENABLED` (ex.: `FEATURE_AGENDA_ENABLED`)
- Frontend: `NEXT_PUBLIC_FEATURE_<AREA>` (ex.: `NEXT_PUBLIC_FEATURE_AGENDA`)
- Default: **desligado** quando não setado (deny-by-default).

## Inventário

### F1 · /agenda — calendário interno

| Item | Valor |
|---|---|
| Flag backend | — (sem rota dedicada) |
| Flag frontend | `NEXT_PUBLIC_FEATURE_AGENDA` |
| Substituir por | Google Calendar (sync já existente) **ou** schema próprio + CRUD |
| Custo | $0 se usar só Google Calendar |
| Esforço | 8-16h pra UI consumir `google.events` em vez de `WEEK_EVENTS` mock |

### F2 · /bater-papo — chat geral (legacy)

| Item | Valor |
|---|---|
| Flag backend | — (chat real está em /agentes via `/api/conversations`) |
| Flag frontend | `NEXT_PUBLIC_FEATURE_BATER_PAPO` |
| Substituir por | redirecionar pra /agentes ou plugar feed unificado |
| Custo | $0 |
| Esforço | 4-8h |

### F3 · /documentos — repositório de documentos

| Item | Valor |
|---|---|
| Flag backend | — (apenas `/api/profile/identity/documents` é real) |
| Flag frontend | `NEXT_PUBLIC_FEATURE_DOCUMENTOS` |
| Substituir por | Google Drive API (OAuth já existe) ou bucket S3-like + tabela |
| Custo | $0 com Drive · S3 ~$0.023/GB/mês |
| Esforço | 16-24h pra listagem + tags + busca |

### F4 · /financas — dashboard financeiro

| Item | Valor |
|---|---|
| Flag backend | — |
| Flag frontend | `NEXT_PUBLIC_FEATURE_FINANCAS` |
| Substituir por | derivar de `transactions` Pluggy + classificação por agente |
| Custo | $0 (Pluggy já contratado) |
| Esforço | 24-40h — agregações, gráficos, classificação automática |

### F5 · /bancos · sub-tab Boletos

| Item | Valor |
|---|---|
| Flag frontend | `NEXT_PUBLIC_FEATURE_BANCOS_BOLETOS` |
| Substituir por | API banco específico (Bradesco/Itaú/BB) ou parser CNAB 240/400 |
| Custo | varia por banco; CNAB é gratuito |
| Esforço | 24-60h dependendo do banco |

### F6 · /bancos · sub-tab Cartões (faturas)

| Item | Valor |
|---|---|
| Flag frontend | `NEXT_PUBLIC_FEATURE_BANCOS_CARTOES` |
| Substituir por | scraping da fatura (Pluggy não cobre) ou import manual de XLSX |
| Custo | $0 com import manual |
| Esforço | 16-32h |

### F7 · /bancos · sub-tab PIX

| Item | Valor |
|---|---|
| Flag frontend | `NEXT_PUBLIC_FEATURE_BANCOS_PIX` |
| Substituir por | API banco específico (Bradesco/Itaú/Inter PIX) |
| Custo | varia |
| Esforço | 24-40h |

### F8 · /bancos · sub-tab Tributos

| Item | Valor |
|---|---|
| Flag frontend | `NEXT_PUBLIC_FEATURE_BANCOS_TRIBUTOS` |
| Substituir por | DCTFWeb / e-CAC parser, ou import manual |
| Custo | $0 com manual |
| Esforço | 24-48h |

### B1 · /empresas · busca por CPF (sócios)

| Item | Valor |
|---|---|
| Flag backend | `FEATURE_BUSCA_EMPRESAS_POR_CPF_ENABLED` |
| Flag frontend | `NEXT_PUBLIC_FEATURE_BUSCA_EMPRESAS_POR_CPF` |
| Substituir por | trocar token público de teste em `CPF_LOOKUP_API_KEY` por token pago do CPF.CNPJ |
| Custo | R$ 0,23 por consulta (assinatura mensal) |
| Esforço | 0h — só virar a flag e setar a chave |
| Reativar | 1) cadastrar em `https://www.cpfcnpj.com.br/register/`, 2) `CPF_LOOKUP_API_KEY=<token-pago>` no `.env`, 3) `FEATURE_BUSCA_EMPRESAS_POR_CPF_ENABLED=true` |

## Como reativar uma feature

1. Plugue a fonte real (API/scraper/import).
2. Substitua o mock `*-data.ts` ou rota stub por chamadas reais.
3. Vire a flag no `.env`:
   ```
   FEATURE_AGENDA_ENABLED=true
   NEXT_PUBLIC_FEATURE_AGENDA=true
   ```
4. Rebuild os containers (`docker compose build` — frontend precisa rebuild
   pra `NEXT_PUBLIC_*` virar literal estático, backend pega na hora).
5. Atualize este arquivo: mova a feature pra histórico abaixo.

## Histórico (features já reativadas)

_(vazio — preencher conforme integrações forem entrando)_
