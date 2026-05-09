# Specs — Sprints F + G + H

3 sprints encadeadas que continuam o trabalho de Contatos/Organizations.
Felipe aprova de uma vez, eu executo cada uma marcando pausa entre commits
como nas anteriores. Ao final de cada sprint, pausa maior pra validação e2e
no browser antes de seguir pra próxima.

| Sprint | Tema | Commits |
|--------|------|---------|
| F | Tela `/empresas` + cleanup do shadow `company_name` | 4 |
| G | Sync Google Contacts (pull-only) | 4 |
| H | Aniversários no Google Calendar | 2 |

---

# Sprint F — Tela `/empresas` + cleanup `company_name`

## Contexto

Sprint E criou Organizations mas a única forma de gerenciar é abrindo um
contato e usando o combobox. Felipe não tem visão central das empresas — quais
estão sem CNPJ, quais nunca foram enriquecidas, quais não têm contato vinculado.

Esta sprint entrega `/empresas` (página dedicada com listagem, filtros, edição
e enrich) e finaliza o ciclo removendo o shadow `Contact.company_name` —
todo dado já foi migrado pra `organization_id`, manter a coluna só polui.

## Escopo

**INCLUI:**
- Endpoint `GET /api/organizations` retorna `contact_count` agregado por org
- Endpoint `GET /api/organizations/stats` (total, com_cnpj, enriched, sem_contatos)
- Tela `/empresas` no frontend: listagem + busca + filtros (com/sem CNPJ, enriquecidas, sem contatos) + modal de edição + enrich inline
- Item no Sidebar de navegação ("Empresas")
- Migration final: descarta coluna `company_name` da tabela `contacts`
- Frontend deixa de referenciar `company_name` em qualquer lugar
- 5 testes novos

**NÃO INCLUI:**
- Mesclar 2 organizations em uma
- Histórico de alterações
- Drag-drop / bulk
- Lista de contatos da org dentro do modal (mostra só count e link "ver contatos vinculados" que filtra `/contatos`)

## Decisões

1. **DROP COLUMN** existe no SQLite >= 3.35 (Mar/2021). Imagem `python:3.12-slim` traz SQLite 3.40+, sem problema. Em produção SQLite, cair pra recreate-table fallback se a versão for antiga (verifica `sqlite_version()`).
2. **Pré-condição obrigatória** antes do drop: rodar `migrate_contact_company_names.py` de novo pra garantir 0 strings órfãs. O backup do dia anterior segue intacto.
3. **`/empresas`** usa o mesmo padrão visual de `/contatos`: sidebar com filtros, área central com listagem, modal de edição. Sem drawer de detalhes — empresa é uma entidade simples, modal direto resolve.
4. **CNPJ** é exibido formatado (00.000.000/0000-00) na lista, mas no DB segue só dígitos.
5. **Schema TS**: remover `Contact.company_name` do tipo. Em qualquer JSON antigo o campo é só ignorado.

## Passos

### Backend

`services/organization_service.py`:
- `list_organizations`: passa a fazer join com count de contatos não-deletados
- `get_stats(db) -> dict`: total, with_cnpj, enriched, without_contacts

Schema:
- `OrganizationRead.contact_count: int = 0`

Rota:
- `GET /api/organizations/stats` → `OrganizationStats`

Migration físico:
- Adicionar entry em `_RUNTIME_COLUMN_MIGRATIONS` que **remove** `contacts.company_name`. Lógica: se a coluna ainda existe E `sqlite_version >= "3.35"` → `ALTER TABLE contacts DROP COLUMN company_name`. Caso contrário, log warning e segue.
- Antes de dropar, log: `DROP company_name: contacts ainda com company_name preenchido = N` (sanity check; deve ser 0 depois do migrate idempotente).
- Spec separada: NÃO dropa se `N > 0` — força operador a rodar a migration de dados primeiro.

Tests `tests/test_organizations.py` (5 novos):
1. `list` retorna `contact_count` correto
2. Stats retorna campos esperados
3. Backend ignora `company_name` no payload de Contact (já não está no schema)
4. Migration drop é idempotente (rodar 2× não falha)
5. Migration drop NÃO roda se ainda há `company_name` populado (segurança)

### Frontend

`lib/contacts-types.ts`:
- Remover `Contact.company_name`
- `Organization` ganha `contact_count: number`
- Novo `OrganizationStats`

`lib/contacts-api.ts`:
- `getOrganizationStats()`

Componentes novos:
- `app/empresas/page.tsx` (TopBar) + `app/empresas/EmpresasHub.tsx`
- `components/empresas/OrgRow.tsx` (linha densa)
- `components/empresas/OrgModal.tsx` (modal de edição completa: name, trade_name, cnpj, industry, website, notes; botão Atualizar via Receita)
- `components/empresas/EmpresasSidebar.tsx` (filtros)

Nav:
- `lib/nav.ts` adicionar `/empresas` com ícone `building`

Cleanup:
- Tirar todas as referências a `company_name` em `ContactCard.tsx`, `ContactRow.tsx`, `ContactDetail.tsx`, `utils.ts` (helper `contactCompany` passa a usar só `organization?.name`)

## Commits sugeridos

1. `feat(backend): organizations stats + count_contacts + migration drop company_name`
2. `feat(frontend): tela /empresas com listagem, filtros e edição`
3. `feat(frontend): item Empresas no menu de navegação`
4. `chore: remove referencias a Contact.company_name do frontend`

## Validação E2E

Backend:
- [ ] pytest 33/33 (28 anteriores + 5 novos)
- [ ] Restart backend → `contacts.company_name` some, queries continuam OK
- [ ] `GET /api/organizations` retorna `contact_count`
- [ ] `GET /api/organizations/stats` retorna agregados

Frontend:
- [ ] Item Empresas aparece no menu lateral
- [ ] `/empresas` lista todas as orgs com contagem
- [ ] Filtro "Sem CNPJ" reduz lista
- [ ] Editar org → salva
- [ ] "Atualizar via Receita" funciona em org com CNPJ
- [ ] Build limpo

---

# Sprint G — Sync Google Contacts (pull-only)

## Contexto

OAuth Google da Sprint C está parado: só serve pra listar 5 contatos como
smoke test. Esta sprint usa de verdade — sincroniza todos os contatos do
Google pro hub, com dedup inteligente e sem perder dados que Felipe
adicionou manualmente no hub.

Pull-only nesta sprint: Google é a fonte de verdade pros contatos que vivem
lá; o hub é fonte de verdade pros contatos criados aqui (família,
sócios, etc). Push reverso fica pra sprint futura.

## Escopo

**INCLUI:**
- Endpoint `POST /api/google/contacts/sync` (assíncrono, retorna jobId)
- Endpoint `GET /api/google/contacts/sync-status` — última sync (timestamp,
  count_imported, count_updated, count_skipped, errors)
- Persistência: `Contact.external_source` ("google" | null) e
  `Contact.external_id` (Google `resourceName`)
- Match strategy:
  1. Por `external_id` (Google resourceName) → update
  2. Por email exato (case-insensitive, primeiro email) → update + grava external_id
  3. Por phone normalizado (só dígitos, últimos 8 dígitos quando há +DDI) → update + grava external_id
  4. Senão, cria novo
- Contatos importados ganham tag automática `google`
- Botão "Sincronizar agora" no `GoogleConnectCard` em `/configuracoes`
- Toast de progresso + resultado
- 6 testes novos

**NÃO INCLUI:**
- Push hub → Google
- Sync automático cron (manual nesta sprint)
- Resolução interativa de conflito (campos do Google sobrescrevem hub se
  diferentes — única exceção: `notes` do hub é preservada)
- Foto via Gravatar
- Histórico (cada sync sobrescreve `sync-status`)

## Decisões

1. **`external_id` único parcial**: índice único quando preenchido (NULL permitido).
2. **Conflito de campos**: Google ganha em name/email/phone/birthday. `notes`
   do hub é sempre preservada. Tags são merged (não substituídas).
3. **Pagination**: People API retorna 100 por chamada. Sprint busca todas as
   páginas em uma única request (sem job assíncrono real — síncrono dentro do
   handler, mas com timeout maior). Mono-user, volume esperado < 5k contatos.
4. **Telefone normalizado**: regex remove tudo não-dígito, pega últimos 8
   dígitos. Match imperfeito mas pragmático pra evitar duplicatas.
5. **Errors**: erros individuais (ex: contato sem email/phone E sem nome)
   viram `count_skipped++` com motivo no array `errors`. Não param a sync
   inteira.
6. **Tag automática**: tag `google` é só uma label — Felipe pode remover
   depois sem efeito colateral.

## Passos

### Backend

Modelo:
- `Contact.external_source = Column(String, index=True)` (nullable)
- `Contact.external_id = Column(String, unique=True, index=True)` (nullable)
- Migration runtime adiciona ambas

Service `services/google/contacts_sync_service.py`:
- `fetch_all_google_contacts(db) -> list[GoogleContactDTO]`: usa creds via `oauth_service.get_credentials`, paginate até esgotar
- `sync_google_contacts(db) -> SyncReport`: itera, faz match, atualiza/cria

Estado:
- Tabela nova `google_sync_state` (id=1, last_sync_at, last_report_json) ou usar `agent_preferences` table existente? Decisão: tabela própria simples.

Rota `routes/google_contacts.py`:
- `POST /api/google/contacts/sync` → executa síncrono (até 60s)
- `GET /api/google/contacts/sync-status` → estado da última sync

Tests (6):
1. Match por external_id (existente) atualiza
2. Match por email atualiza + preserva notes
3. Match por phone normalizado funciona com formatos diferentes (`+5511999...` vs `(11) 99999-...`)
4. Sem match → cria com tag `google`
5. Sync vazio (zero contatos no Google) não quebra
6. People API erro 401 → retorna 500 com mensagem clara

### Frontend

`lib/google-api.ts`:
- `syncGoogleContacts()` → POST
- `getSyncStatus()` → GET

`components/integrations/GoogleConnectCard.tsx`:
- Quando `connected=true`, adiciona seção "Contatos sincronizados" com último timestamp + botão "Sincronizar agora"
- Durante sync: spinner + texto "Importando…"
- Após: toast "N novos · M atualizados · K ignorados"

## Commits sugeridos

1. `feat(backend): Contact.external_source/id + sync state model`
2. `feat(backend): sync_google_contacts service + endpoints + 6 testes`
3. `feat(frontend): botão Sincronizar Google no GoogleConnectCard`

## Validação E2E

Backend:
- [ ] pytest 39/39 (33 + 6)
- [ ] `POST /api/google/contacts/sync` com OAuth ativo → retorna report; segunda chamada não duplica

Frontend:
- [ ] Card Google em `/configuracoes` mostra "Sincronizar agora" quando conectado
- [ ] Click → spinner → toast com contagem
- [ ] `/contatos` mostra contatos importados com tag `google`
- [ ] Build limpo

---

# Sprint H — Aniversários no Google Calendar

## Contexto

Felipe quer que aniversários dos contatos virem eventos automáticos no
calendar dele — com lembrete 1 dia antes. Idempotente: rodar 2× não cria
evento duplicado. Operação é one-shot (botão); cron fica pra futuro.

Escopo super pequeno (2 commits) — fechamos com elegância.

## Escopo

**INCLUI:**
- Calendar dedicado: criado uma vez, nome "Aniversários · Felipe Hub"
- Para cada `Contact.birthday IS NOT NULL`, cria/atualiza evento anual recorrente:
  - Título: "🎂 Aniversário de {nome}"
  - Data: birthday do contato (ano original ignorado, recorrência anual)
  - Recorrência: `RRULE:FREQ=YEARLY`
  - Lembrete: popup 1 dia antes
  - `extended_properties.private.contact_id` = id do contato (idempotência)
- Endpoint `POST /api/google/calendar/sync-birthdays`
- Botão no `GoogleConnectCard`
- 3 testes (Google Calendar API mockada)

**NÃO INCLUI:**
- Aniversários de empresas (data de fundação)
- Notificação custom (só lembrete padrão)
- Removal automático quando deleta contato (manual no Google)
- Sync recorrente

## Decisões

1. **Calendar separado**: cria/recupera por nome exato. Felipe pode esconder/
   desativar/colorir lá.
2. **Identidade**: extended_properties.private.contact_id é a chave.
   Rodar de novo lê todos eventos com esse private prop, casa por contact_id,
   atualiza ou ignora.
3. **Datas com ano**: usa o ano corrente como `start.date`, recorrência YEARLY
   garante aniversário todos os anos. Funciona com birthdays sem ano (assume
   ano atual no campo `date`).

## Passos

### Backend

Service `services/google/calendar_service.py`:
- `ensure_birthday_calendar(creds) -> calendar_id`: GET list, match por
  summary, senão POST criar
- `sync_birthdays(db) -> dict`: itera contatos com birthday, faz upsert
  baseado em `extended_properties.private.contact_id`

Rota `routes/google_calendar.py`:
- `POST /api/google/calendar/sync-birthdays`

Tests (3):
1. Cria calendar quando não existe + cria 2 eventos pra 2 contatos com birthday
2. Re-rodar atualiza eventos existentes (mesma quantidade, sem duplicação)
3. Contatos sem birthday são ignorados

### Frontend

`GoogleConnectCard`: adiciona seção "Aniversários" com botão "Criar/atualizar
no Calendar" + último timestamp se já rodou.

`lib/google-api.ts`: `syncBirthdays()`

## Commits sugeridos

1. `feat(backend): calendar_service.sync_birthdays + endpoint + 3 testes`
2. `feat(frontend): botão Sincronizar aniversários no GoogleConnectCard`

## Validação E2E

Backend:
- [ ] pytest 42/42 (39 + 3)
- [ ] Sync com 2 contatos com birthday → 2 eventos no calendar "Aniversários · Felipe Hub" no Google
- [ ] Sync de novo → mesmos 2 eventos atualizados, 0 duplicados

Frontend:
- [ ] Botão "Sincronizar aniversários" aparece quando Google conectado
- [ ] Click → toast com contagem
- [ ] Build limpo

---

## Ordem de execução

1. F primeiro (operacional — fecha ciclo Empresas)
2. G depois (volume maior, requer F estável pra match decente)
3. H por último (consume Calendar API que ainda não foi usado)

Pausa maior entre sprints pra e2e manual no browser.
