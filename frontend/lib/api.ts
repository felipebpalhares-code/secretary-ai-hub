/**
 * Cliente HTTP para o backend FastAPI.
 * Endpoints mapeados em backend/routes/connections.py + main.py
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export class ApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    super(`API ${status}`)
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

/* ───────── Helpers ───────── */

export function isBackendUp() {
  return health()
    .then(() => true)
    .catch(() => false)
}
