"use client"
/**
 * Sprint H — editor de permissions por checkbox.
 *
 * Renderiza um card por módulo (com ações ver/criar/editar/deletar/etc.)
 * conforme PERMISSION_MODULES. Módulos admin-only não aparecem aqui.
 * Roles ADMIN ignoram o JSON inteiro no backend, então só faz sentido
 * exibir o editor pra ASSISTANT.
 */
import { PERMISSION_MODULES, type PermissionMap } from "@/lib/auth-api"

export function PermissionsEditor({
  value,
  onChange,
  disabled,
}: {
  value: PermissionMap
  onChange: (next: PermissionMap) => void
  disabled?: boolean
}) {
  function setFlag(module: string, action: string, on: boolean) {
    const current = value[module] ?? {}
    onChange({ ...value, [module]: { ...current, [action]: on } })
  }

  function bulk(module: string, on: boolean) {
    const spec = PERMISSION_MODULES.find((m) => m.key === module)
    if (!spec) return
    const next = Object.fromEntries(spec.actions.map((a) => [a.key, on]))
    onChange({ ...value, [module]: next })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {PERMISSION_MODULES.map((mod) => {
        const flags = value[mod.key] ?? {}
        const allOn = mod.actions.every((a) => flags[a.key])
        const noneOn = mod.actions.every((a) => !flags[a.key])
        return (
          <div
            key={mod.key}
            className="border border-hair rounded-md p-3 bg-card"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[12px] font-bold text-ink tracking-[-.1px]">
                {mod.label}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={disabled || allOn}
                  onClick={() => bulk(mod.key, true)}
                  className="text-[10px] font-medium text-ink-3 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Todos
                </button>
                <span className="text-ink-4">·</span>
                <button
                  type="button"
                  disabled={disabled || noneOn}
                  onClick={() => bulk(mod.key, false)}
                  className="text-[10px] font-medium text-ink-3 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Nenhum
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {mod.actions.map((act) => {
                const checked = Boolean(flags[act.key])
                return (
                  <label
                    key={act.key}
                    className="flex items-center gap-2 text-[12px] text-ink cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={checked}
                      onChange={(e) => setFlag(mod.key, act.key, e.target.checked)}
                      className="rounded border-hair text-accent focus:ring-accent"
                    />
                    {act.label}
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function emptyPermissions(): PermissionMap {
  return Object.fromEntries(
    PERMISSION_MODULES.map((m) => [
      m.key,
      Object.fromEntries(m.actions.map((a) => [a.key, false])),
    ]),
  )
}
