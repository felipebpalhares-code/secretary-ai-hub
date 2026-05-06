/**
 * Estado do wizard de criação de agente — 5 passos.
 *
 * Vive só em memória (não persiste em localStorage). Sair com dados
 * preenchidos dispara modal de confirmação na própria página.
 */
import { create } from "zustand"

export type WizardStep = 1 | 2 | 3 | 4 | 5

export type WizardInstruction = {
  id: string                 // uuid local — sobrevive até POST no Step 5
  content: string
}

export type WizardState = {
  step: WizardStep

  // Step 1
  name: string
  role: string

  // Step 2
  persona: string

  // Step 3
  instructions: WizardInstruction[]

  // Step 4 — arquivos vivem só no client até o Step 5
  documents: File[]

  /* mutators */
  setStep: (s: WizardStep) => void
  next:    () => void
  prev:    () => void

  setIdentity: (patch: Partial<Pick<WizardState, "name" | "role">>) => void
  setPersona:  (v: string) => void

  addInstruction:    (content: string) => void
  updateInstruction: (id: string, content: string) => void
  removeInstruction: (id: string) => void
  reorderInstructions: (ids: string[]) => void

  addDocuments:    (files: File[]) => void
  removeDocument:  (index: number) => void

  reset: () => void
  isDirty: () => boolean
}

const initial = {
  step: 1 as WizardStep,
  name: "",
  role: "",
  persona: "",
  instructions: [] as WizardInstruction[],
  documents: [] as File[],
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export const useAgentWizard = create<WizardState>((set, get) => ({
  ...initial,

  setStep: (s) => set({ step: s }),
  next: () => set((st) => ({ step: Math.min(5, st.step + 1) as WizardStep })),
  prev: () => set((st) => ({ step: Math.max(1, st.step - 1) as WizardStep })),

  setIdentity: (patch) => set(patch),
  setPersona:  (v) => set({ persona: v }),

  addInstruction: (content) =>
    set((st) => ({ instructions: [...st.instructions, { id: newId(), content }] })),

  updateInstruction: (id, content) =>
    set((st) => ({
      instructions: st.instructions.map((i) => (i.id === id ? { ...i, content } : i)),
    })),

  removeInstruction: (id) =>
    set((st) => ({ instructions: st.instructions.filter((i) => i.id !== id) })),

  reorderInstructions: (ids) =>
    set((st) => {
      const map = new Map(st.instructions.map((i) => [i.id, i]))
      return { instructions: ids.map((id) => map.get(id)!).filter(Boolean) }
    }),

  addDocuments:   (files) => set((st) => ({ documents: [...st.documents, ...files] })),
  removeDocument: (index) =>
    set((st) => ({ documents: st.documents.filter((_, i) => i !== index) })),

  reset: () => set({ ...initial }),

  isDirty: () => {
    const s = get()
    return Boolean(
      s.name || s.role || s.persona || s.instructions.length || s.documents.length,
    )
  },
}))
