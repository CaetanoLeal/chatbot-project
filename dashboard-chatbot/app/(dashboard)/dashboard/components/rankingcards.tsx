import { TopFunilItem, TopInstanciaItem } from "../lib/types"
import { formatNumber, formatPercent } from "../lib/format"

export function TopFunnelsList({ data }: { data: TopFunilItem[] }) {
  return (
    <ul className="space-y-3">
      {data.map((f, i) => (
        <li key={f.nome + i}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-2 text-zinc-700 font-medium truncate">
              <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 text-[10px] flex items-center justify-center font-semibold shrink-0">
                {i + 1}
              </span>
              <span className="truncate">{f.nome}</span>
            </span>
            <span className="text-zinc-400 shrink-0">
              {formatNumber(f.totalUtilizadores)} utilizadores
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden ml-6">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${f.taxaConclusao}%` }} />
          </div>
          <p className="text-[11px] text-zinc-400 ml-6 mt-0.5">
            {formatPercent(f.taxaConclusao)} de conclusão
          </p>
        </li>
      ))}
    </ul>
  )
}

export function TopInstancesList({ data }: { data: TopInstanciaItem[] }) {
  const max = Math.max(1, ...data.map((d) => d.totalMensagens))

  return (
    <ul className="space-y-3">
      {data.map((inst, i) => (
        <li key={inst.nome + i}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-2 text-zinc-700 font-medium truncate">
              <span className="w-4 h-4 rounded-full bg-sky-50 text-sky-700 text-[10px] flex items-center justify-center font-semibold shrink-0">
                {i + 1}
              </span>
              <span className="truncate">{inst.nome}</span>
            </span>
            <span className="text-zinc-800 font-medium tabular-nums shrink-0">
              {formatNumber(inst.totalMensagens)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden ml-6">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{ width: `${(inst.totalMensagens / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}