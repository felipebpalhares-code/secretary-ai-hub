/**
 * Cliente HTTP para o flow OAuth Google (rotas em backend/routes/google_auth.py).
 *
 * `start` nao precisa de fetch — basta apontar window.location.href pra
 * `${BASE}/api/auth/google/start`. As funcoes abaixo cobrem status/teste/disconnect.
 */
import { BASE, request } from "./api"

export type GoogleStatus = {
  connected: boolean
  email: string | null
  expires_at: string | null
  scopes: string[]
}

export type GoogleContact = {
  name: string
  email: string
}

export type GoogleTestResponse = {
  ok: boolean
  contacts?: GoogleContact[]
  error?: string
}

export const googleStartUrl = `${BASE}/api/auth/google/start`

export async function getStatus(): Promise<GoogleStatus> {
  return request<GoogleStatus>("/api/auth/google/status")
}

export async function disconnect(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/api/auth/google/disconnect", { method: "POST" })
}

/**
 * Smoke test: bate em /api/google/test e devolve a resposta crua.
 * Em 401/500 nao lanca — devolve {ok:false,error} pra UI tratar visualmente.
 */
export async function testConnection(): Promise<GoogleTestResponse> {
  const res = await fetch(`${BASE}/api/google/test`)
  const payload = (await res.json().catch(() => ({}))) as Partial<GoogleTestResponse>
  if (!res.ok) {
    return {
      ok: false,
      error: payload.error || `Falha ao testar conexao (HTTP ${res.status})`,
    }
  }
  return { ok: true, contacts: payload.contacts ?? [] }
}
