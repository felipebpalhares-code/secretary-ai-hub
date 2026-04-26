"use client"
import { useState, useCallback } from "react"
import { ConvSidebar } from "@/components/chat/ConvSidebar"
import { ChatMain } from "@/components/chat/ChatMain"
import { AgentFeed } from "@/components/chat/AgentFeed"
import { AtaModal } from "@/components/chat/AtaModal"
import { useChatSocket, type WsUpdate } from "@/lib/useChatSocket"

export function ChatHub() {
  const [active, setActive] = useState("briefing")
  const [feedOpen, setFeedOpen] = useState(true)
  const [ataOpen, setAtaOpen] = useState(false)
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [liveMessages, setLiveMessages] = useState<WsUpdate[]>([])

  const handleUpdate = useCallback((u: WsUpdate) => {
    setLiveMessages((prev) => {
      // Substitui status pelo message quando chega
      if (u.type === "message") {
        return [...prev.filter((m) => m.type !== "status"), u]
      }
      if (u.type === "status") {
        return [...prev.filter((m) => m.type !== "status"), u]
      }
      return [...prev, u]
    })
  }, [])

  const { state, send } = useChatSocket(handleUpdate)

  const sendMessage = (content: string) => {
    if (send(content)) {
      // optimistic user msg poderia ser adicionado aqui
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden min-w-0">
      <ConvSidebar active={active} onSelect={setActive} onMeeting={() => setMeetingOpen(true)} />
      <ChatMain
        onAta={() => setAtaOpen(true)}
        onToggleFeed={() => setFeedOpen((f) => !f)}
        connectionState={state}
        liveMessages={liveMessages}
        onSend={sendMessage}
      />
      {feedOpen && <AgentFeed />}
      <AtaModal open={ataOpen} onClose={() => setAtaOpen(false)} />
    </div>
  )
}
