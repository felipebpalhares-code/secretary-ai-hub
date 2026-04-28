"use client"
import { Icon } from "@/components/Icon"
import { EmptyState } from "@/components/ui/EmptyState"

/**
 * Sem backend de finanças/centros-de-custo/obras ainda.
 * Empty state honesto até o CRUD existir.
 *
 * Nota: dados patrimoniais (Investimentos, Imóveis) já moram em
 * /quem-sou-eu → Financeiro. Esta tela é pra fluxo operacional
 * (centros de custo, obras, cartas de crédito) — feature futura.
 */
export function FinancasHub() {
  return (
    <div className="flex-1 overflow-y-auto bg-bg-app">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-bg-surface border border-default rounded-xl">
          <EmptyState
            icon="chart"
            title="Sem entidades financeiras cadastradas"
            subtitle={
              <>
                Esta tela vai exibir <strong>centros de custo</strong>,{" "}
                <strong>obras</strong> e <strong>cartas de crédito</strong> quando o
                cadastro for liberado. Investimentos e imóveis pessoais ficam em{" "}
                <a className="text-brand underline" href="/quem-sou-eu">
                  Quem Sou Eu → Financeiro
                </a>
                .
              </>
            }
          />
        </div>

        <div className="mt-8 text-tiny text-text-tertiary uppercase tracking-wider font-medium flex items-center gap-2">
          <Icon name="chart" size={12} />
          <span>Em breve: centros de custo, obras, consórcios.</span>
        </div>
      </div>
    </div>
  )
}
