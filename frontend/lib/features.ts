/**
 * Sistema de feature flags do frontend.
 *
 * Cada flag vem de uma env var `NEXT_PUBLIC_FEATURE_*` injetada no build
 * do Next.js. Default é `false` (deny-by-default) — features ainda não
 * integradas com fonte real ficam off até a flag ser setada.
 *
 * Documentação por flag: docs/PENDENCIAS.md.
 */

const TRUTHY = new Set(["1", "true", "yes", "on"])

function read(name: string): boolean {
  // Process.env values são literais string injetadas no build pelo Next.
  // Usamos lookup direto com o nome completo pra Next conseguir tree-shake.
  const raw = (process.env[`NEXT_PUBLIC_FEATURE_${name}`] ?? "").toLowerCase()
  return TRUTHY.has(raw)
}

export const FEATURES = {
  agenda: read("AGENDA"),
  baterPapo: read("BATER_PAPO"),
  documentos: read("DOCUMENTOS"),
  financas: read("FINANCAS"),
  bancosBoletos: read("BANCOS_BOLETOS"),
  bancosCartoes: read("BANCOS_CARTOES"),
  bancosPix: read("BANCOS_PIX"),
  bancosTributos: read("BANCOS_TRIBUTOS"),
  buscaEmpresasPorCpf: read("BUSCA_EMPRESAS_POR_CPF"),
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key]
}
