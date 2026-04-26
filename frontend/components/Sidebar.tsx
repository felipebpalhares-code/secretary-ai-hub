"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV } from "@/lib/nav"
import { Icon } from "./Icon"
import { cn } from "@/lib/cn"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[236px] min-w-[236px] shrink-0 bg-[#0f172a] flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-[10px] px-[18px] pt-[18px] pb-4 border-b border-white/[.06]">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm tracking-[-.02em]">
          FH
        </div>
        <div>
          <div className="text-[14px] font-bold text-slate-100 tracking-[-.25px]">Felipe Hub</div>
          <div className="text-[10px] text-slate-500 font-medium mt-px">Secretário Pessoal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-[10px] overflow-y-auto scrollbar-none">
        {NAV.map((group) => (
          <div key={group.label}>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[.07em] px-3 pt-3 pb-1">
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-[11px] px-3 py-2 rounded-[7px] text-[13px] font-medium mb-0.5 transition-colors tracking-[-.1px]",
                    active
                      ? "bg-[rgba(79,70,229,.15)] text-indigo-100"
                      : "text-slate-400 hover:bg-white/[.04] hover:text-slate-200"
                  )}
                >
                  <Icon name={item.icon as any} size={15} className="opacity-90" />
                  <span className="flex-1">{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={cn(
                        "text-[10.5px] font-semibold px-[7px] py-px rounded-full",
                        item.countVariant === "alert"
                          ? "bg-red-600/20 text-red-300"
                          : item.countVariant === "notice"
                            ? "bg-amber-600/20 text-amber-300"
                            : item.countVariant === "ok"
                              ? "bg-emerald-600/20 text-emerald-300"
                              : "bg-white/[.04] text-slate-500"
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-[10px] border-t border-white/[.06]">
        <div className="flex items-center gap-[10px] px-[10px] py-2 rounded-lg hover:bg-white/[.04] transition-colors cursor-pointer">
          <div className="w-[30px] h-[30px] rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
            F
          </div>
          <div>
            <div className="text-[12.5px] font-semibold text-slate-200">Felipe Palhares</div>
            <div className="text-[10.5px] text-slate-500 mt-px">Administrador</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
