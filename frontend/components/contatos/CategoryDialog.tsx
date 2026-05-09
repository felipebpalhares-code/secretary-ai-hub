"use client"
import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { FormField, TextInput, PrimaryButton, SecondaryButton } from "@/components/ui/FormField"
import type { Category, CategoryCreate, CategoryUpdate } from "@/lib/contacts-types"
import { createCategory, updateCategory } from "@/lib/contacts-api"

const SWATCHES = [
  "#3B82F6", // azul (Família)
  "#8B5CF6", // violeta (Sócios)
  "#10B981", // verde (Profissionais)
  "#F59E0B", // âmbar (Negócios)
  "#EF4444", // vermelho
  "#06B6D4", // ciano
  "#EC4899", // rosa
  "#64748B", // slate
]

type Mode =
  | { kind: "create" }
  | { kind: "edit"; category: Category }

export function CategoryDialog({
  open,
  mode,
  onClose,
  onSaved,
}: {
  open: boolean
  mode: Mode
  onClose: () => void
  onSaved: (cat: Category) => void
}) {
  const [name, setName] = useState("")
  const [color, setColor] = useState<string>(SWATCHES[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDefault = mode.kind === "edit" && mode.category.is_default
  const nameDisabled = isDefault

  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode.kind === "edit") {
      setName(mode.category.name)
      setColor(mode.category.color || SWATCHES[0])
    } else {
      setName("")
      setColor(SWATCHES[0])
    }
  }, [open, mode])

  async function submit() {
    setError(null)
    if (!nameDisabled && !name.trim()) {
      setError("Nome é obrigatório")
      return
    }
    setSubmitting(true)
    try {
      let saved: Category
      if (mode.kind === "edit") {
        const payload: CategoryUpdate = { color }
        // Default categories: bloqueio de nome no UI; mandar pra API só se mudou
        if (!nameDisabled && name.trim() !== mode.category.name) {
          payload.name = name.trim()
        }
        saved = await updateCategory(mode.category.id, payload)
      } else {
        const payload: CategoryCreate = { name: name.trim(), color }
        saved = await createCategory(payload)
      }
      onSaved(saved)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar categoria")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode.kind === "edit" ? "Editar categoria" : "Nova categoria"}
      size="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={submitting}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton onClick={submit} disabled={submitting}>
            {submitting ? "Salvando…" : "Salvar"}
          </PrimaryButton>
        </>
      }
    >
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-err text-[11.5px] font-semibold px-3 py-2 rounded">
          {error}
        </div>
      )}

      <FormField
        label="Nome"
        required={!nameDisabled}
        hint={nameDisabled ? "Categoria padrão — nome não pode ser alterado" : undefined}
      >
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={nameDisabled}
          placeholder="ex: Médicos"
        />
      </FormField>

      <FormField label="Cor">
        <div className="flex items-center gap-2 flex-wrap">
          {SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setColor(s)}
              aria-label={`Cor ${s}`}
              className={
                "w-7 h-7 rounded-full border-2 transition-all " +
                (color.toLowerCase() === s.toLowerCase()
                  ? "border-ink scale-110"
                  : "border-transparent hover:scale-105")
              }
              style={{ background: s }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded-full border-2 border-hair cursor-pointer p-0"
            aria-label="Cor customizada"
          />
          <span className="text-[10.5px] text-ink-3 font-mono ml-2">{color.toUpperCase()}</span>
        </div>
      </FormField>
    </Modal>
  )
}
