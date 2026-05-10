/**
 * Helper de streaming SSE para POST /api/conversations/{id}/messages.
 *
 * Backend usa POST + Server-Sent Events. EventSource só fala GET,
 * então usamos fetch + ReadableStream e parseamos os frames `data: ...\n\n`
 * manualmente.
 */
import { ApiError, BASE } from "./api"

export type MessageChunk =
  | { type: "meta"; user_message_id: string; assistant_message_id: string }
  | { type: "delta"; content: string }
  | { type: "done"; tokens_used: number }
  | { type: "error"; content: string }

export type SendMessageHandlers = {
  onChunk: (chunk: MessageChunk) => void
  signal?: AbortSignal
}

/**
 * Envia mensagem do usuário e consome o stream SSE chamando `onChunk`
 * pra cada frame. Resolve quando o stream termina (após o "done" ou "error").
 */
export async function sendMessageStream(
  conversationId: string,
  content: string,
  { onChunk, signal }: SendMessageHandlers,
): Promise<void> {
  const res = await fetch(`${BASE}/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ content }),
    credentials: "include", // Sprint H — envia cookie httpOnly access_token
    signal,
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new ApiError(res.status, payload)
  }
  if (!res.body) throw new Error("Resposta sem body de streaming")

  const reader = res.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  try {
    // Lê o stream até EOF, separando em frames "data: ...\n\n"
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let idx: number
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        const dataLine = frame
          .split("\n")
          .find((l) => l.startsWith("data: "))
        if (!dataLine) continue
        const json = dataLine.slice("data: ".length)
        try {
          onChunk(JSON.parse(json) as MessageChunk)
        } catch {
          // frame malformado — ignora silenciosamente
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
