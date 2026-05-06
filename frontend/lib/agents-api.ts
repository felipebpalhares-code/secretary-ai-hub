/**
 * Cliente HTTP do módulo de Agentes IA.
 * Espelha backend/routes/agents.py.
 */
import { ApiError, BASE, request } from "./api"

/* ───────────────────────── tipos ───────────────────────── */

export type AgentStatus = "draft" | "active" | "paused"
export type DocumentStatus = "processing" | "ready" | "failed"
export type MessageRole = "user" | "assistant" | "system"
export type WebhookEvent = "on_message_received" | "on_response_sent" | "on_action_taken"

export type Instruction = {
  id: string
  agent_id: string
  content: string
  order: number
  created_at: string
}

export type InstructionCreate = {
  content: string
  order: number
}

export type Agent = {
  id: string
  name: string
  role: string
  description: string | null
  persona: string | null
  system_prompt: string | null
  model: string
  temperature: number
  max_tokens: number
  status: AgentStatus
  created_at: string
  updated_at: string
  instructions: Instruction[]
}

export type AgentCreate = {
  name: string
  role: string
  description?: string | null
  persona?: string | null
  model?: string
  temperature?: number
  max_tokens?: number
  status?: AgentStatus
  instructions?: InstructionCreate[]
}

export type AgentUpdate = Partial<{
  name: string
  role: string
  description: string | null
  persona: string | null
  model: string
  temperature: number
  max_tokens: number
  status: AgentStatus
}>

export type DocumentMeta = {
  id: string
  agent_id: string
  filename: string
  mime_type: string | null
  chunks_count: number
  total_tokens: number
  status: DocumentStatus
  error_message: string | null
  created_at: string
}

export type Conversation = {
  id: string
  agent_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  tokens_used: number
  created_at: string
}

export type Webhook = {
  id: string
  agent_id: string
  event: WebhookEvent
  url: string
  has_secret: boolean
  active: boolean
  created_at: string
}

export type WebhookCreate = {
  event: WebhookEvent
  url: string
  secret?: string | null
  active?: boolean
}

export type WebhookUpdate = Partial<WebhookCreate>

/* ───────────────────────── agents ───────────────────────── */

export const listAgents      = ()                              => request<Agent[]>("/api/agents")
export const getAgent        = (id: string)                    => request<Agent>(`/api/agents/${id}`)
export const createAgent     = (payload: AgentCreate)          => request<Agent>("/api/agents",            { method: "POST",   body: JSON.stringify(payload) })
export const updateAgent     = (id: string, payload: AgentUpdate) => request<Agent>(`/api/agents/${id}`,    { method: "PATCH",  body: JSON.stringify(payload) })
export const deleteAgent     = (id: string)                    => request<{ ok: boolean }>(`/api/agents/${id}`, { method: "DELETE" })

/* ───────────────────── instructions ───────────────────── */

export const addInstruction    = (agentId: string, payload: InstructionCreate) =>
  request<Instruction>(`/api/agents/${agentId}/instructions`, { method: "POST", body: JSON.stringify(payload) })

export const removeInstruction = (agentId: string, instructionId: string) =>
  request<{ ok: boolean }>(`/api/agents/${agentId}/instructions/${instructionId}`, { method: "DELETE" })

/* ───────────────────── documents ───────────────────── */

export const listDocuments = (agentId: string) =>
  request<DocumentMeta[]>(`/api/agents/${agentId}/documents`)

export const deleteDocument = (agentId: string, documentId: string) =>
  request<{ ok: boolean }>(`/api/agents/${agentId}/documents/${documentId}`, { method: "DELETE" })

export async function uploadDocument(agentId: string, file: File): Promise<DocumentMeta> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch(`${BASE}/api/agents/${agentId}/documents`, { method: "POST", body: form })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new ApiError(res.status, payload)
  }
  return res.json()
}

/* ───────────────────── conversations ───────────────────── */

export const listConversations    = (agentId: string)               => request<Conversation[]>(`/api/agents/${agentId}/conversations`)
export const createConversation   = (agentId: string, title?: string | null) =>
  request<Conversation>(`/api/agents/${agentId}/conversations`, { method: "POST", body: JSON.stringify({ title: title ?? null }) })
export const getConversation      = (id: string)                    => request<Conversation>(`/api/conversations/${id}`)
export const deleteConversation   = (id: string)                    => request<{ ok: boolean }>(`/api/conversations/${id}`, { method: "DELETE" })
export const listMessages         = (conversationId: string)        => request<Message[]>(`/api/conversations/${conversationId}/messages`)

/* ───────────────────── webhooks ───────────────────── */

export const listWebhooks   = (agentId: string)                       => request<Webhook[]>(`/api/agents/${agentId}/webhooks`)
export const createWebhook  = (agentId: string, payload: WebhookCreate) => request<Webhook>(`/api/agents/${agentId}/webhooks`, { method: "POST", body: JSON.stringify(payload) })
export const updateWebhook  = (id: string, payload: WebhookUpdate)    => request<Webhook>(`/api/webhooks/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
export const deleteWebhook  = (id: string)                            => request<{ ok: boolean }>(`/api/webhooks/${id}`, { method: "DELETE" })
