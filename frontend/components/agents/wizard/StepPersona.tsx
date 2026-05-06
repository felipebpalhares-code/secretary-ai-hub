"use client"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useAgentWizard } from "@/stores/agentWizard"
import { WizardFooter } from "./WizardFooter"

const MIN_CHARS = 30

const schema = z.object({
  persona: z
    .string()
    .trim()
    .min(MIN_CHARS, `Descreva a persona com ao menos ${MIN_CHARS} caracteres`)
    .max(2000, "Texto muito longo"),
})

type FormData = z.infer<typeof schema>

const EXAMPLES: { label: string; text: string }[] = [
  {
    label: "Advogado",
    text:
      "Advogado experiente com 20 anos de carreira em direito empresarial. Formal mas didático, sempre explica termos técnicos. Especialidade em contratos e tributário.",
  },
  {
    label: "CFO",
    text:
      "Profissional financeiro, analítico e direto. Foca em fluxo de caixa, projeções e alertas. Sempre justifica com números.",
  },
  {
    label: "Gestor de Obras",
    text:
      "Engenheiro civil sênior, prático, focado em prazos e custos. Comunica em bullet points objetivos.",
  },
]

export function StepPersona() {
  const { persona, setPersona, prev, next } = useAgentWizard()
  const [showExamples, setShowExamples] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { persona },
    mode: "onSubmit",
  })

  const value = watch("persona") ?? ""
  const count = value.trim().length

  useEffect(() => {
    document.getElementById("wizard-persona")?.focus()
  }, [])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!showExamples) return
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowExamples(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [showExamples])

  const onValid = (data: FormData) => {
    setPersona(data.persona.trim())
    next()
  }

  const applyExample = (text: string) => {
    setValue("persona", text, { shouldDirty: true, shouldValidate: false })
    setShowExamples(false)
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-loose">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display text-text-primary">Quem é esse agente?</h1>
          <p className="text-body text-text-secondary mt-2">
            Descreva personalidade, tom de voz e especialidade.
          </p>

          <div className="mt-loose">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="wizard-persona" className="block text-small text-text-secondary">
                Persona
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowExamples((s) => !s)}
                  className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary px-2 py-1 rounded-default hover:bg-bg-subtle transition"
                >
                  Ver exemplos
                  <ChevronDown size={14} strokeWidth={1.5} />
                </button>
                {showExamples && (
                  <div className="absolute right-0 top-full mt-1 z-20 w-72 bg-bg-surface border border-default rounded-md shadow-md overflow-hidden">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex.label}
                        type="button"
                        onClick={() => applyExample(ex.text)}
                        className="block w-full text-left px-3 py-2 hover:bg-bg-subtle transition border-b border-default last:border-0"
                      >
                        <div className="text-body-strong text-text-primary">{ex.label}</div>
                        <div className="text-tiny text-text-tertiary line-clamp-2 mt-0.5">{ex.text}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                id="wizard-persona"
                {...register("persona")}
                placeholder="Advogado experiente com 20 anos de carreira em direito empresarial. Formal mas didático, sempre explica termos técnicos. Especialidade em contratos e tributário."
                rows={8}
                className={`w-full bg-bg-surface border rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary transition focus:outline-none focus:ring-2 resize-none min-h-48 ${
                  errors.persona
                    ? "border-danger focus:border-danger focus:ring-danger/10"
                    : "border-default focus:border-brand focus:ring-brand/10"
                }`}
              />
              <div className="absolute bottom-2 right-3 text-tiny text-text-tertiary tabular-nums">
                {count}/{MIN_CHARS}
              </div>
            </div>

            {errors.persona && <p className="text-small text-danger mt-1">{errors.persona.message}</p>}
          </div>
        </div>
      </div>

      <WizardFooter onBack={prev}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-brand text-white rounded-default px-4 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition"
        >
          Continuar
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </WizardFooter>
    </form>
  )
}
