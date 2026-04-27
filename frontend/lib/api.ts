/**
 * Cliente HTTP para o backend FastAPI.
 * Endpoints mapeados em backend/routes/connections.py + main.py
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export class ApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : null
    super(detail ? `${detail} (HTTP ${status})` : `API ${status}`)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new ApiError(res.status, payload)
  }
  return res.json()
}

/* ───────── Health ───────── */

export async function health(): Promise<{ status: string }> {
  return request("/health")
}

/* ───────── Conexões / WhatsApp ───────── */

export async function whatsappStatus() {
  return request<{ channel: string; state: any }>("/api/connections/whatsapp/status")
}

export async function whatsappQrcode() {
  return request<any>("/api/connections/whatsapp/qrcode")
}

export async function whatsappDisconnect() {
  return request<any>("/api/connections/whatsapp/disconnect", { method: "POST" })
}

export async function whatsappSendAlert(params: { to: string; agent: string; message: string }) {
  return request<{ ok: boolean }>("/api/connections/whatsapp/send-alert", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

/* ───────── Discord ───────── */

export async function discordPost(params: { agent: string; content: string }) {
  return request<{ ok: boolean }>("/api/connections/discord/post", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

/* ───────── Logs unificado ───────── */

export type MessageLog = {
  id: number
  channel: string
  direction: "in" | "out"
  sender: string
  agent: string | null
  body: string
  flag: string | null
  created_at: string
}

export async function getLogs(params?: { channel?: string; limit?: number }): Promise<MessageLog[]> {
  const q = new URLSearchParams()
  if (params?.channel) q.set("channel", params.channel)
  if (params?.limit) q.set("limit", String(params.limit))
  const qs = q.toString()
  return request<MessageLog[]>(`/api/connections/logs${qs ? `?${qs}` : ""}`)
}

export async function searchLogs(query: string, limit = 50) {
  const q = new URLSearchParams({ q: query, limit: String(limit) })
  return request<{ id: number; channel: string; body: string; created_at: string }[]>(
    `/api/connections/logs/search?${q}`
  )
}

/* ───────── Bancos / Pluggy ───────── */

export type RemoteAccount = {
  id: number
  pluggyId: string
  name: string
  number: string
  agency: string | null
  type: string
  subtype: string | null
  balance: number
  currency: string
  entity: string
  isPrimary: boolean
  lastSyncedAt: string
}

export type RemoteTransaction = {
  id: number
  pluggyId: string
  accountId: string
  date: string
  amount: number
  description: string
  category: string | null
  agentCategory: string | null
  agentAssigned: string | null
  type: "CREDIT" | "DEBIT"
  conciliated: boolean
}

export type RemoteConnection = {
  id: number
  pluggyItemId: string
  bankName: string
  imageUrl: string | null
  entity: string
  status: string
  lastSyncedAt: string | null
}

export async function banksConnectToken(itemId?: string) {
  return request<{ accessToken: string }>("/api/banks/connect-token", {
    method: "POST",
    body: JSON.stringify(itemId ? { itemId } : {}),
  })
}

export async function banksConnections() {
  return request<RemoteConnection[]>("/api/banks/connections")
}

export async function banksSync() {
  return request<{ ok: boolean; items_synced: number }>("/api/banks/connections/sync", {
    method: "POST",
  })
}

export async function banksAccounts(entity?: string) {
  const qs = entity ? `?entity=${entity}` : ""
  return request<RemoteAccount[]>(`/api/banks/accounts${qs}`)
}

export async function banksSummary() {
  return request<{ total: number; byEntity: Record<string, number>; accountCount: number }>(
    "/api/banks/accounts/summary"
  )
}

export async function banksTransactions(params?: {
  accountId?: string
  entity?: string
  days?: number
}) {
  const q = new URLSearchParams()
  if (params?.accountId) q.set("account_id", params.accountId)
  if (params?.entity) q.set("entity", params.entity)
  if (params?.days) q.set("days", String(params.days))
  const qs = q.toString()
  return request<RemoteTransaction[]>(`/api/banks/transactions${qs ? `?${qs}` : ""}`)
}

export async function banksSyncTransactions(accountId: string, days = 30) {
  return request<{ ok: boolean; inserted: number }>("/api/banks/transactions/sync", {
    method: "POST",
    body: JSON.stringify({ accountId, days }),
  })
}

export async function categorizeTx(
  txId: number,
  body: {
    agentCategory?: string
    agentAssigned?: string
    costCenterId?: number
    conciliated?: boolean
  }
) {
  return request<{ ok: boolean }>(`/api/banks/transactions/${txId}/categorize`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

/* ───────── Profile ───────── */

export type Identity = {
  full_name: string | null
  nickname: string | null
  birth_date: string | null
  cpf: string | null
  rg: string | null
  cnh_number: string | null
  cnh_expiry: string | null
  cnh_category: string | null
  passport_number: string | null
  passport_expiry: string | null
  marital_status: string | null
  religion: string | null
  birthplace: string | null
}

export type Preferences = {
  how_to_address: string | null
  communication_style: string | null
  work_hours_start: string | null
  work_hours_end: string | null
  work_days: string | null
  emergency_contact: string | null
  life_priorities: string[]
}

export async function getIdentity() {
  return request<Identity>("/api/profile/identity")
}

export async function updateIdentity(payload: Partial<Identity>) {
  return request<Identity>("/api/profile/identity", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function getPreferences() {
  return request<Preferences>("/api/profile/preferences")
}

export async function updatePreferences(payload: Partial<Preferences>) {
  return request<Preferences>("/api/profile/preferences", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

/* ───────── Empresarial ───────── */

export type Company = {
  id: number
  name: string
  cnpj: string | null
  industry: string | null
  role: string | null
  ownership_pct: number | null
  is_active: boolean
  systems: string[]
  nome_fantasia: string | null
  capital_social: number | null
  porte: string | null
  natureza_juridica: string | null
  address_full: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
  telefone: string | null
  email: string | null
  simples_nacional: boolean
  mei: boolean
}

export type CompanyInput = Omit<Company, "id">

export async function listCompanies() {
  return request<Company[]>("/api/profile/companies")
}
export async function createCompany(payload: CompanyInput) {
  return request<Company>("/api/profile/companies", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateCompany(id: number, payload: CompanyInput) {
  return request<Company>(`/api/profile/companies/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteCompany(id: number) {
  return request<{ ok: boolean }>(`/api/profile/companies/${id}`, { method: "DELETE" })
}

export type Partner = {
  id: number
  company_id: number
  name: string
  cpf: string | null
  phone: string | null
  email: string | null
  ownership: number | null
}
export type PartnerInput = Omit<Partner, "id" | "company_id">

export async function listPartners(companyId: number) {
  return request<Partner[]>(`/api/profile/companies/${companyId}/partners`)
}
export async function createPartner(companyId: number, payload: PartnerInput) {
  return request<Partner>(`/api/profile/companies/${companyId}/partners`, {
    method: "POST", body: JSON.stringify(payload),
  })
}
export async function updatePartner(id: number, payload: PartnerInput) {
  return request<Partner>(`/api/profile/partners/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deletePartner(id: number) {
  return request<{ ok: boolean }>(`/api/profile/partners/${id}`, { method: "DELETE" })
}

export type Professional = {
  id: number
  role: string
  name: string
  register: string | null
  phone: string | null
  email: string | null
  notes: string | null
}
export type ProfessionalInput = Omit<Professional, "id">

export async function listProfessionals() {
  return request<Professional[]>("/api/profile/professionals")
}
export async function createProfessional(payload: ProfessionalInput) {
  return request<Professional>("/api/profile/professionals", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateProfessional(id: number, payload: ProfessionalInput) {
  return request<Professional>(`/api/profile/professionals/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteProfessional(id: number) {
  return request<{ ok: boolean }>(`/api/profile/professionals/${id}`, { method: "DELETE" })
}

/* ───────── Família ───────── */

export type FamilyRelation = "conjuge" | "filho" | "pai" | "mae" | "irmao"

export type FamilyMember = {
  id: number
  relation: FamilyRelation | string
  name: string
  cpf: string | null
  birth_date: string | null
  phone: string | null
  email: string | null
  school: string | null
  school_phone: string | null
  doctor_name: string | null
  notes: string | null
}
export type FamilyMemberInput = Omit<FamilyMember, "id">

export async function listFamily() {
  return request<FamilyMember[]>("/api/profile/family")
}
export async function createFamilyMember(payload: FamilyMemberInput) {
  return request<FamilyMember>("/api/profile/family", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateFamilyMember(id: number, payload: FamilyMemberInput) {
  return request<FamilyMember>(`/api/profile/family/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteFamilyMember(id: number) {
  return request<{ ok: boolean }>(`/api/profile/family/${id}`, { method: "DELETE" })
}

export type FamilyDoctor = {
  id: number
  name: string
  specialty: string | null
  phone: string | null
  clinic: string | null
  serves: string | null
}
export type FamilyDoctorInput = Omit<FamilyDoctor, "id">

export async function listFamilyDoctors() {
  return request<FamilyDoctor[]>("/api/profile/family-doctors")
}
export async function createFamilyDoctor(payload: FamilyDoctorInput) {
  return request<FamilyDoctor>("/api/profile/family-doctors", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateFamilyDoctor(id: number, payload: FamilyDoctorInput) {
  return request<FamilyDoctor>(`/api/profile/family-doctors/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteFamilyDoctor(id: number) {
  return request<{ ok: boolean }>(`/api/profile/family-doctors/${id}`, { method: "DELETE" })
}

/* ───────── Financeiro ───────── */

export type Investment = {
  id: number
  type: string
  institution: string | null
  approx_value: number | null
  rate_description: string | null
}
export type InvestmentInput = Omit<Investment, "id">

export async function listInvestments() {
  return request<Investment[]>("/api/profile/investments")
}
export async function createInvestment(payload: InvestmentInput) {
  return request<Investment>("/api/profile/investments", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateInvestment(id: number, payload: InvestmentInput) {
  return request<Investment>(`/api/profile/investments/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteInvestment(id: number) {
  return request<{ ok: boolean }>(`/api/profile/investments/${id}`, { method: "DELETE" })
}

export type RealEstate = {
  id: number
  label: string
  address: string | null
  registration: string | null
  approx_value: number | null
  is_financed: boolean
  financed_until: string | null
}
export type RealEstateInput = Omit<RealEstate, "id">

export async function listRealEstate() {
  return request<RealEstate[]>("/api/profile/real-estate")
}
export async function createRealEstate(payload: RealEstateInput) {
  return request<RealEstate>("/api/profile/real-estate", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateRealEstate(id: number, payload: RealEstateInput) {
  return request<RealEstate>(`/api/profile/real-estate/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteRealEstate(id: number) {
  return request<{ ok: boolean }>(`/api/profile/real-estate/${id}`, { method: "DELETE" })
}

/* ───────── Jurídico ───────── */

export type LegalCase = {
  id: number
  case_number: string
  case_type: string | null
  court: string | null
  lawyer_name: string | null
  lawyer_oab: string | null
  next_deadline: string | null
  status: "active" | "closed" | string
  outcome: string | null
  closed_date: string | null
  notes: string | null
}
export type LegalCaseInput = Omit<LegalCase, "id">

export async function listLegalCases() {
  return request<LegalCase[]>("/api/profile/legal-cases")
}
export async function createLegalCase(payload: LegalCaseInput) {
  return request<LegalCase>("/api/profile/legal-cases", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateLegalCase(id: number, payload: LegalCaseInput) {
  return request<LegalCase>(`/api/profile/legal-cases/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteLegalCase(id: number) {
  return request<{ ok: boolean }>(`/api/profile/legal-cases/${id}`, { method: "DELETE" })
}

export type Contract = {
  id: number
  type: string
  parties: string | null
  expiry_date: string | null
  notes: string | null
}
export type ContractInput = Omit<Contract, "id">

export async function listContracts() {
  return request<Contract[]>("/api/profile/contracts")
}
export async function createContract(payload: ContractInput) {
  return request<Contract>("/api/profile/contracts", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateContract(id: number, payload: ContractInput) {
  return request<Contract>(`/api/profile/contracts/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteContract(id: number) {
  return request<{ ok: boolean }>(`/api/profile/contracts/${id}`, { method: "DELETE" })
}

/* ───────── Acessos (cofre) ───────── */

export type VaultCategory = "gov" | "bank" | "system"

export type VaultEntry = {
  id: number
  category: VaultCategory | string
  name: string
  username: string | null
  url: string | null
  notes: string | null
}
export type VaultEntryInput = {
  category: VaultCategory | string
  name: string
  username: string | null
  password: string | null   // null no PUT mantém senha existente
  url: string | null
  notes: string | null
}

export async function listVault(category?: VaultCategory) {
  const qs = category ? `?category=${category}` : ""
  return request<VaultEntry[]>(`/api/profile/vault${qs}`)
}
export async function createVaultEntry(payload: VaultEntryInput) {
  return request<VaultEntry>("/api/profile/vault", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateVaultEntry(id: number, payload: VaultEntryInput) {
  return request<VaultEntry>(`/api/profile/vault/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteVaultEntry(id: number) {
  return request<{ ok: boolean }>(`/api/profile/vault/${id}`, { method: "DELETE" })
}
export async function revealVaultEntry(id: number) {
  return request<{ id: number; password: string | null }>(`/api/profile/vault/${id}/reveal`)
}

/* ───────── Objetivos (Goals) ───────── */

export type GoalCategory = "pessoal" | "empresarial"

export type Goal = {
  id: number
  year: number
  category: GoalCategory | string
  description: string
  progress: number
  is_done: boolean
}
export type GoalInput = Omit<Goal, "id">

export async function listGoals() {
  return request<Goal[]>("/api/profile/goals")
}
export async function createGoal(payload: GoalInput) {
  return request<Goal>("/api/profile/goals", { method: "POST", body: JSON.stringify(payload) })
}
export async function updateGoal(id: number, payload: GoalInput) {
  return request<Goal>(`/api/profile/goals/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}
export async function deleteGoal(id: number) {
  return request<{ ok: boolean }>(`/api/profile/goals/${id}`, { method: "DELETE" })
}

/* ───────── Utilitários: CNPJ via BrasilAPI ───────── */

export type CnpjQsaItem = {
  nome: string | null
  qual: string | null
  cpf_cnpj_mascarado: string | null
  percentual: number | null
}

export type CnpjLookup = {
  razao_social: string | null
  nome_fantasia: string | null
  ramo: string | null
  status: "active" | "inactive"
  capital_social: number | null
  porte: string | null
  natureza_juridica: string | null
  address_full: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
  telefone: string | null
  email: string | null
  simples_nacional: boolean
  mei: boolean
  qsa: CnpjQsaItem[]
  source: "brasilapi" | "opencnpj" | string
}

export async function lookupCnpj(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "")
  return request<CnpjLookup>(`/api/utils/cnpj/${digits}`)
}

/* ───────── Utilitários: Empresas por CPF (CPF.CNPJ) ───────── */

export type CompanyByCpf = {
  cnpj: string
  razao_social: string | null
  nome_fantasia: string | null
  qualificacao: string | null
  data_entrada: string | null   // YYYY-MM-DD
  situacao: "active" | "inactive"
}

export async function lookupCompaniesByCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "")
  return request<CompanyByCpf[]>(`/api/utils/companies-by-cpf/${digits}`)
}

/* ───────── Utilitários: OCR genérico de documentos de pessoa ───────── */

export type ScanDocumentKind = "cnh" | "rg" | "cpf" | "passaporte"

export type ExtractedPersonData = {
  full_name?: string | null
  cpf?: string | null
  rg?: string | null
  birth_date?: string | null
  gender?: "M" | "F" | null
  mother_name?: string | null
  father_name?: string | null
  nationality?: string | null
  cnh_number?: string | null
  cnh_category?: string | null
  cnh_expiry?: string | null
}

export async function extractPersonDocument(
  file: File,
  kind: ScanDocumentKind = "rg",
): Promise<{ extracted: ExtractedPersonData }> {
  const form = new FormData()
  form.append("file", file)
  form.append("kind", kind)
  const res = await fetch(`${BASE}/api/utils/extract-person-document`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new ApiError(res.status, payload)
  }
  return res.json()
}

/* ───────── Banner stats ───────── */

export type BannerStats = {
  companies: number
  legal_cases_active: number
  real_estate: number
  goals_open: number
  legal_deadline_soon: boolean
}

export async function getBannerStats() {
  return request<BannerStats>("/api/profile/banner-stats")
}

export type IdentityDocumentKind = "cnh" | "rg" | "passport" | "other"

export type IdentityDocument = {
  id: number
  kind: IdentityDocumentKind | string
  filename: string
  mime_type: string
  size_bytes: number
  uploaded_at: string
}

export type ExtractResponse = {
  document_id: number
  filename: string
  mime_type: string
  extracted: Partial<Identity>
}

export async function extractIdentity(
  file: File,
  kind: IdentityDocumentKind = "other",
): Promise<ExtractResponse> {
  const form = new FormData()
  form.append("file", file)
  form.append("kind", kind)
  const res = await fetch(`${BASE}/api/profile/identity/extract`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new ApiError(res.status, payload)
  }
  return res.json()
}

export async function listIdentityDocuments() {
  return request<IdentityDocument[]>("/api/profile/identity/documents")
}

export function identityDocumentUrl(id: number) {
  return `${BASE}/api/profile/identity/documents/${id}`
}

export async function deleteIdentityDocument(id: number) {
  return request<{ ok: boolean }>(`/api/profile/identity/documents/${id}`, {
    method: "DELETE",
  })
}

/* ───────── Helpers ───────── */

export function isBackendUp() {
  return health()
    .then(() => true)
    .catch(() => false)
}
