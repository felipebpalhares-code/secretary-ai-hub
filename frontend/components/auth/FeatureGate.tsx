"use client"
/**
 * Gate por feature flag — esconde children se a feature estiver off.
 * Pra páginas inteiras, use o `<DisabledFeaturePage>` que mostra um
 * estado "Em construção" e link pra docs/PENDENCIAS.md.
 */
import type { ReactNode } from "react"

import { isFeatureEnabled, type FeatureKey } from "@/lib/features"
import { TopBar } from "@/components/TopBar"
import { EmptyState } from "@/components/ui/EmptyState"

export function FeatureGate({
  feature,
  fallback = null,
  children,
}: {
  feature: FeatureKey
  fallback?: ReactNode
  children: ReactNode
}) {
  if (!isFeatureEnabled(feature)) return <>{fallback}</>
  return <>{children}</>
}

/**
 * Wrapper de página inteira: se a feature estiver off, renderiza um
 * EmptyState consistente em vez do conteúdo real.
 */
export function DisabledFeaturePage({
  feature,
  title,
  reason,
  children,
}: {
  feature: FeatureKey
  title: string
  reason: string
  children: ReactNode
}) {
  if (isFeatureEnabled(feature)) return <>{children}</>

  return (
    <>
      <TopBar title={title} subtitle="Feature em construção" />
      <div className="flex-1 overflow-y-auto">
        <EmptyState
          icon="settings"
          title="Funcionalidade em construção"
          subtitle={
            <>
              {reason}
              <br />
              Detalhes em <span className="font-mono">docs/PENDENCIAS.md</span>.
            </>
          }
        />
      </div>
    </>
  )
}
