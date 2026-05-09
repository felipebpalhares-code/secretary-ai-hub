"use client"
import { useEffect, useRef, useState } from "react"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import { searchTags } from "@/lib/contacts-api"
import type { Tag } from "@/lib/contacts-types"

export function TagInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const [draft, setDraft] = useState("")
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true
    const t = setTimeout(async () => {
      try {
        const tags = await searchTags(draft, 8)
        if (!mounted) return
        const lower = new Set(value.map((v) => v.toLowerCase()))
        setSuggestions(tags.filter((t) => !lower.has(t.name.toLowerCase())))
      } catch {
        if (mounted) setSuggestions([])
      }
    }, 180)
    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [draft, value])

  function add(name: string) {
    const n = name.trim().toLowerCase()
    if (!n) return
    if (value.some((v) => v.toLowerCase() === n)) {
      setDraft("")
      return
    }
    onChange([...value, n])
    setDraft("")
  }

  function remove(name: string) {
    onChange(value.filter((v) => v.toLowerCase() !== name.toLowerCase()))
  }

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 bg-bg border border-hair rounded-md px-2 py-1.5 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded border bg-hair-2 text-ink-2 border-hair"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                remove(tag)
              }}
              className="text-ink-3 hover:text-err"
              aria-label={`Remover tag ${tag}`}
            >
              <Icon name="close" size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              add(draft)
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          placeholder={value.length ? "" : "Digite uma tag e Enter"}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[12px] text-ink placeholder:text-ink-3 py-0.5"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 left-0 right-0 max-h-44 overflow-y-auto bg-card border border-hair rounded-md shadow-md">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                add(s.name)
              }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-[12px] text-ink-2 hover:bg-bg-subtle"
              )}
            >
              #{s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
