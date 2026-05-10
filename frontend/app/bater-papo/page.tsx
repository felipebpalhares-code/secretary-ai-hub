import { ChatHub } from "./ChatHub"
import { DisabledFeaturePage } from "@/components/auth/FeatureGate"

export default function BaterPapoPage() {
  return (
    <DisabledFeaturePage
      feature="baterPapo"
      title="Bater Papo"
      reason="Chat unificado legado. Use /agentes pra conversar com os especialistas IA — chat real está lá."
    >
      <ChatHub />
    </DisabledFeaturePage>
  )
}
