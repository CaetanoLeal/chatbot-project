//app/(dashboard)/dashboard/components/kpicard.tsx
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  variacao?: number
  icon: LucideIcon
  accent?: "teal" | "sky" | "amber" | "violet" | "emerald" | "zinc"
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, { bg: string; text: string }> = {
  teal: { bg: "bg-teal-50", text: "text-teal-700" },
  sky: { bg: "bg-sky-50", text: "text-sky-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
  zinc: { bg: "bg-zinc-100", text: "text-zinc-700" },
}

export default function KpiCard({
  title,
  value,
  subtitle,
  variacao,
  icon: Icon,
  accent = "teal",
}: KpiCardProps) {
  const colors = ACCENTS[accent]
  const hasTrend = typeof variacao === "number"
  const isPositive = (variacao ?? 0) > 0
  const isNeutral = (variacao ?? 0) === 0

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${colors.bg} ${colors.text}`}>
          <Icon size={18} strokeWidth={2} />
        </span>

        {hasTrend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
              isNeutral ? "text-zinc-400" : isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {isNeutral ? <Minus size={12} /> : isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(variacao ?? 0).toFixed(1)}%
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-semibold text-zinc-800 tabular-nums tracking-tight">{value}</p>
        <p className="text-sm text-zinc-500 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}