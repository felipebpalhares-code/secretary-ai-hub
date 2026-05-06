"use client"
import type { ReactNode } from "react"

/**
 * Footer fixo do wizard: [Voltar] [esquerda livre] [Continuar/Criar].
 *
 * O slot `extras` (à esquerda) é usado por steps que têm "Pular este passo".
 */
export function WizardFooter({
  onBack,
  backLabel = "Voltar",
  extras,
  children,
}: {
  onBack?: () => void
  backLabel?: string
  extras?: ReactNode
  children: ReactNode // botão de "Continuar" / "Criar agente" do step
}) {
  return (
    <div className="border-t border-default bg-bg-surface px-6 md:px-8 py-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-text-secondary hover:text-text-primary text-body-strong font-medium px-3 py-2 rounded-default hover:bg-bg-subtle transition"
            >
              {backLabel}
            </button>
          ) : (
            <div />
          )}
          {extras}
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  )
}
