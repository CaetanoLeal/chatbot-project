import { ReactNode } from "react"
import { Inbox } from "lucide-react"

interface ChartCardProps {
  title: string
  subtitle?: string
  className?: string
  isEmpty?: boolean
  emptyLabel?: string
  children: ReactNode
  action?: ReactNode
}

export default function ChartCard({
  title,
  subtitle,
  className = "",
  isEmpty = false,
  emptyLabel = "Sem dados neste período",
  children,
  action,
}: ChartCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col min-w-0 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-zinc-300">
          <Inbox size={28} strokeWidth={1.5} />
          <p className="text-xs text-zinc-400">{emptyLabel}</p>
        </div>
      ) : (
        <div className="flex-1 min-w-0">{children}</div>
      )}
    </div>
  )
}