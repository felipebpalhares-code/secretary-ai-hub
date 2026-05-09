# Spec — Sprint E: Empresa dos contatos como entidade

## Contexto

Sprint D deixou `Contact.company_name` como texto livre. Toda vez que Felipe escreve "PalharesTech", "Palhares Tech" ou "palharestech ltda" em contatos diferentes, vira string solta — sem dados de CNPJ, sem vínculo, sem deduplicação.

Sprint E transforma essa string num registro estruturado (`Organization`) com lookup opcional de CNPJ via BrasilAPI, autocomplete na hora de digitar e migration que aproveita os strings existentes (não tem nenhum agora porque o e2e foi limpo, mas a migration roda idempotente).

A rota `GET /api/utils/cnpj/{cnpj}` já existe há sprints — só vamos consumir; nada de reescrever.

---

## Escopo

**INCLUI:**
- Modelo `Organization` (id, name, trade_name, cnpj nullable, industry, website, notes, enriched_at)
- FK `Contact.organization_id` (substitui `company_name` na escrita; coluna antiga vira shadow read-only durante o ciclo)
- 5 endpoints REST: list (com autocomplete por prefixo), create, update, delete, enrich (puxa BrasilAPI e preenche)
- Script de migration `scripts/migrate_contact_company_names.py` — lê todos os `company_name` distintos (case-insensitive trim), cria Organizations e atualiza FK
- ContactModal: campo "Empresa" vira combobox com autocomplete + opção "Criar nova"
- Botão "Buscar dados por CNPJ" no formulário de Organization que dispara enrich
- 8 testes pytest novos

**NÃO INCLUI** (sprints futuras):
- Tela `/empresas` dedicada (lista + edição visual de Organizations)
- Sync com Google Contacts
- Gmail inbox scan
- Calendário de aniversários
- Vínculo automático Organization ↔ LegalCase / Contract / BankAccount
- Many-to-many Contact↔Organization com `role` por vínculo (cada contato tem **uma** organization nesta sprint; segunda empresa = segundo contato ou notes)
- Auto-enrich ao salvar (só on-demand pelo botão)

---

## Decisões já tomadas (não revalidar)

1. **CNPJ opcional**: empresas pequenas, freelas, ou estrangeiras não têm CNPJ. Nome basta. Validação só de formato (14 dígitos) quando preenchido.
2. **Deduplicação**: strings de `company_name` com mesmo `name.strip().lower()` viram a mesma Organization na migration. Não tenta resolver "PalharesTech" vs "Palhares Tech" automaticamente — mantém literal e Felipe corrige depois.
3. **Soft delete não se aplica**: deletar Organization é deleção física + `Contact.organization_id = null` nos vinculados. Diferente de Contact (que é soft) porque Organization é só catálogo.
4. **Conflito existente do model `Company`**: o model atual `Company` em `models/profile.py` é das **empresas do Felipe** (com `ownership_pct`, sócios, dados encrypted). Não reusar — confunde escopo. Cria entidade nova `Organization` em `models/contact.py` mesmo arquivo dos contatos.
5. **Enrichment guardado**: `enriched_at` (datetime nullable) marca quando foi puxado da BrasilAPI. UI mostra "atualizado há Xd" se preenchido. Re-enrich sobrescreve campos respondidos pela API; o que veio do Felipe (notes, website) é preservado.

---

## Passo 0 — Setup

Nada. Sem deps novas, sem volume novo, sem env. A rota `/api/utils/cnpj/{cnpj}` já existe e é mockada nos testes via `httpx_mock` se necessário.

---

## Passo 1 — Backend: modelo

### `backend/models/contact.py` (acrescentar)

~~~python
class Organization(Base):
    __tablename__ = "organizations"
    id          = Column(Integer, primary_key=True)
    name        = Column(String, nullable=False, index=True)        # razão social ou texto livre
    trade_name  = Column(String)                                    # nome fantasia
    cnpj        = Column(String, unique=True, index=True)           # 14 dígitos sem mask, nullable
    industry    = Column(String)
    website     = Column(String)
    notes       = Column(Text)
    enriched_at = Column(DateTime)                                  # null = nunca enriquecido
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    contacts    = relationship("Contact", back_populates="organization", passive_deletes=True)
~~~

### `backend/models/contact.py` (alterar `Contact`)

Adicionar:
~~~python
organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"))
organization    = relationship("Organization", back_populates="contacts")
~~~

`company_name` continua existindo na tabela e nos schemas como `Optional[str]` mas:
- ContactCreate/Update **ignoram** `company_name` se `organization_id` foi enviado
- ContactRead inclui `company_name` derivado: `organization.name if organization else company_name`

Atualiza `services/database.py` se precisar (já importa `models.contact`).

---

## Passo 2 — Backend: schemas + service + rotas

### `backend/schemas/organization.py`

`OrganizationBase`, `OrganizationCreate`, `OrganizationUpdate`, `OrganizationRead`, `OrganizationEnrichResult`.

CNPJ: validar com regex `^\d{14}$` quando presente; rejeita 11 dígitos (CPF) ou com pontuação (limpa antes).

### `backend/services/organization_service.py`

- `list_organizations(db, q=None, limit=20)` — autocomplete `LIKE q%` em `name` ou em `cnpj` se `q` for só dígitos
- `get_organization(db, id)` — 404 se não existir
- `create_organization(db, data)` — valida CNPJ único quando preenchido
- `update_organization(db, id, data)` — partial; checa unicidade de CNPJ
- `delete_organization(db, id)` — `Contact.organization_id = null` nos vinculados, depois `db.delete()`
- `enrich_from_cnpj(db, id)`:
  - se Organization não tem CNPJ → 400 "Sem CNPJ pra enriquecer"
  - chama `services.profile_extract.lookup_cnpj` (já existente, reusa) ou diretamente o endpoint interno
  - preenche `name` (razao_social), `trade_name` (nome_fantasia), `industry` (ramo), `website` se vier; **não** sobrescreve `notes` nem campos manuais não-derivados
  - seta `enriched_at = datetime.utcnow()`
  - retorna OrganizationRead atualizado

### `backend/routes/organizations.py`

| Método | Rota | Função |
|--------|------|--------|
| GET | `/api/organizations?q=prefix&limit=20` | list/autocomplete |
| POST | `/api/organizations` | criar |
| GET | `/api/organizations/{id}` | detalhe |
| PATCH | `/api/organizations/{id}` | atualizar |
| DELETE | `/api/organizations/{id}` | deletar |
| POST | `/api/organizations/{id}/enrich` | puxar BrasilAPI |

Registrar router no `backend/main.py`.

### Schemas de Contact (alterar)

`ContactCreate.organization_id: Optional[int] = None`
`ContactUpdate.organization_id: Optional[int] = None`
`ContactRead`: adicionar `organization: Optional[OrganizationRead] = None`

---

## Passo 3 — Backend: testes

`backend/tests/test_organizations.py` — 8 cenários (Pydantic + service + rotas, tudo mockado, BrasilAPI mockada via `monkeypatch` em `services.profile_extract.lookup_cnpj`):

1. POST sem CNPJ, só nome → 201
2. POST com CNPJ válido único → 201
3. POST com CNPJ malformado (11 ou 13 dígitos) → 422
4. POST com CNPJ duplicado → 400 com mensagem clara
5. GET `?q=palh` retorna autocomplete por prefixo (case-insensitive)
6. PATCH troca nome → 200, autocomplete acha pelo nome novo
7. DELETE Organization vinculada a Contact → Organization some, Contact.organization_id = null
8. POST `/enrich` com CNPJ válido (BrasilAPI mockada retornando dados) → preenche trade_name/industry e seta enriched_at

Critério: `pytest tests/test_organizations.py -v` passa 8/8 sem rede.

---

## Passo 4 — Backend: migration script

`backend/scripts/migrate_contact_company_names.py`

Idempotente. Executa:
1. Busca todos os contatos com `organization_id IS NULL AND company_name IS NOT NULL AND company_name != ''`
2. Agrupa por `company_name.strip().lower()` (ignora vazios)
3. Pra cada grupo:
   - Se já existe Organization com `lower(name) = grupo` → reusa
   - Senão cria Organization com `name = company_name` original do primeiro contato (preserva capitalização original)
4. Atualiza `Contact.organization_id` em todos os contatos do grupo
5. **Não apaga `company_name`** — fica como shadow read-only. Limpeza física só na próxima sprint quando a UI estiver toda usando organization.

Modo de uso:
~~~bash
docker compose exec backend python scripts/migrate_contact_company_names.py
~~~

Saída: `migrados N contatos em M organizations`. Idempotente — rodar 2× não duplica nada.

---

## Passo 5 — Frontend: types + api client

### `frontend/lib/contacts-types.ts` (acrescentar)

~~~ts
export type Organization = {
  id: number
  name: string
  trade_name: string | null
  cnpj: string | null
  industry: string | null
  website: string | null
  notes: string | null
  enriched_at: string | null
  created_at: string
  updated_at: string
}

export type OrganizationCreate = {
  name: string
  trade_name?: string | null
  cnpj?: string | null
  industry?: string | null
  website?: string | null
  notes?: string | null
}
~~~

E em `Contact`: trocar `company_name: string | null` por:
~~~ts
company_name: string | null   // shadow read-only durante a transição
organization_id: number | null
organization: Organization | null
~~~

### `frontend/lib/contacts-api.ts` (acrescentar)

`listOrganizations(q?, limit=20)`, `createOrganization(payload)`, `updateOrganization(id, payload)`, `deleteOrganization(id)`, `enrichOrganization(id)`.

---

## Passo 6 — Frontend: combobox de Organization no ContactModal

Substitui o `TextInput` simples de "Empresa" por novo componente:

`frontend/components/contatos/OrganizationCombobox.tsx`
- Input controlado
- Busca debounced (180ms) em `listOrganizations(q)` ao digitar
- Dropdown com sugestões
- Item especial no fim: "+ Criar empresa: «query»" (visível só se a query não bate exatamente com nenhuma)
- Click cria via `createOrganization({name: query})` e seleciona o novo id
- Botão "✕" pequeno limpa a seleção (organization_id = null)

ContactModal:
- Estado `organization_id: number | null` em vez de `company_name: string`
- Quando submeter, manda `organization_id` (não manda `company_name`)
- Em modo edit, pré-popula com `mode.contact.organization` se houver, senão fallback `company_name` shadow (mostra texto desbotado com aviso "empresa em texto livre — clique pra escolher uma da lista")

---

## Passo 7 — Frontend: enrichment via CNPJ

No combobox, quando uma Organization tem CNPJ, mostrar um botão pequeno "🔄 Atualizar dados" no item selecionado (não no dropdown). Click chama `enrichOrganization(id)` e atualiza inline.

Se ainda não tem CNPJ: mostra um link "Adicionar CNPJ" que abre um mini-dialog com input de CNPJ + botão "Buscar e salvar".

Não vamos abrir tela cheia de Organization nesta sprint — a única edição é via combobox + dialog mínimo.

---

## Commits sugeridos

1. `feat(backend): modelo Organization + endpoints CRUD + 8 testes`
2. `feat(backend): script de migration de company_name → Organization`
3. `feat(backend): endpoint de enrichment via BrasilAPI`
4. `feat(frontend): combobox de Organization + enrichment inline`

Cada commit deve passar `npm run build` e `pytest` separadamente.

---

## Validação E2E manual

Backend:
- [ ] `pytest tests/test_organizations.py -v` → 8/8
- [ ] Criar 2 contatos com `company_name="PalharesTech"` na mão (via API), rodar migration, ver 1 Organization criada e ambos contatos vinculados
- [ ] `curl POST /api/organizations/{id}/enrich` num CNPJ real (PalharesTech ou Distribuidora Braz) → response traz trade_name/industry/enriched_at preenchidos

Frontend (`localhost:3000/contatos`):
- [ ] Criar contato Felipe Teste, no campo Empresa digitar "Pal" → autocomplete sugere "PalharesTech" se já existe
- [ ] No mesmo campo digitar "NovaCorp" → aparece "+ Criar empresa: NovaCorp" → click cria + associa
- [ ] Em contato existente sem CNPJ → click "Adicionar CNPJ" → digita CNPJ válido → enrich popula nome fantasia e ramo
- [ ] Editar Organization NovaCorp pra adicionar website → save persiste
- [ ] Deletar Organization NovaCorp → contatos vinculados perdem o link mas continuam vivos

---

## Sinais de que está pronto

- 4 commits no `main` com mensagens corretas
- 8 testes verdes (test_organizations) + 10 anteriores (test_contacts) + 9 do google_auth = 27/27
- Combobox funcional com autocomplete + criar inline + enrich
- Migration roda idempotente em DB com dados existentes
- Build do frontend limpo
- `company_name` ainda existe no DB mas a UI escreve só `organization_id` (cleanup físico fica pra Sprint F)
