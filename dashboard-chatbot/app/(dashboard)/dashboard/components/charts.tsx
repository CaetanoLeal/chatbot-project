//app/(dashboard)/dashboard/components/charts.tsx
"use client"

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} 
// @ts-ignore
from "recharts"
import {
  Period,
  TimelinePoint,
  StatusDistribuicaoItem,
  CanalDistribuicaoItem,
  SetorDistribuicaoItem,
  PicoHorarioItem,
  FunilCadastroEtapa,
  STATUS_COLORS,
} from "../lib/types"
import { formatBucketLabel, formatNumber } from "../lib/format"

const AXIS_STYLE = { fontSize: 11, fill: "#a1a1aa" }
const GRID_COLOR = "#f0f0f1"

function TooltipCard({ label, rows }: { label: string; rows: { name: string; value: number; color: string }[] }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="text-zinc-500 mb-1">{label}</p>
      {rows.map((r) => (
        <p key={r.name} className="flex items-center gap-1.5 font-medium text-zinc-700">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: r.color }} />
          {r.name}: {formatNumber(r.value)}
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mensagens recebidas x enviadas ao longo do tempo
// ---------------------------------------------------------------------------

export function MessagesTimelineChart({ data, period }: { data: TimelinePoint[]; period: Period }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRecebidas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradEnviadas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="data"
          tickFormatter={(v: string) => formatBucketLabel(v, period)}
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          content={({ label, payload }: TooltipProps<number, string>) =>
            payload && payload.length ? (
              <TooltipCard
                label={formatBucketLabel(String(label), period)}
                rows={[
                  { name: "Recebidas", value: Number(payload[0]?.value ?? 0), color: "#0d9488" },
                  { name: "Enviadas", value: Number(payload[1]?.value ?? 0), color: "#0ea5e9" },
                ]}
              />
            ) : null
          }
        />
        <Area type="monotone" dataKey="recebidas" stroke="#0d9488" strokeWidth={2} fill="url(#gradRecebidas)" />
        <Area type="monotone" dataKey="enviadas" stroke="#0ea5e9" strokeWidth={2} fill="url(#gradEnviadas)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Atendimentos criados ao longo do tempo
// ---------------------------------------------------------------------------

export function AttendanceTimelineChart({ data, period }: { data: TimelinePoint[]; period: Period }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="data"
          tickFormatter={(v: string) => formatBucketLabel(v, period)}
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
        <Tooltip
          content={({ label, payload }: TooltipProps<number, string>) =>
            payload && payload.length ? (
              <TooltipCard
                label={formatBucketLabel(String(label), period)}
                rows={[{ name: "Atendimentos", value: Number(payload[0]?.value ?? 0), color: "#8b5cf6" }]}
              />
            ) : null
          }
        />
        <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Distribuição de atendimentos por status (donut)
// ---------------------------------------------------------------------------

export function StatusDonutChart({ data }: { data: StatusDistribuicaoItem[] }) {
  const total = data.reduce((acc, d) => acc + d.total, 0)

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="status" innerRadius={44} outerRadius={64} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.codigo} fill={STATUS_COLORS[d.codigo] ?? "#d4d4d8"} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-semibold text-zinc-800 tabular-nums">{formatNumber(total)}</span>
          <span className="text-[10px] text-zinc-400">atendimentos</span>
        </div>
      </div>

      <ul className="flex-1 space-y-1.5 min-w-0">
        {data.map((d) => (
          <li key={d.codigo} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-600 truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[d.codigo] ?? "#d4d4d8" }}
              />
              <span className="truncate">{d.status}</span>
            </span>
            <span className="font-medium text-zinc-800 tabular-nums shrink-0">{formatNumber(d.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mensagens por canal (whatsapp x telegram)
// ---------------------------------------------------------------------------

const CHANNEL_COLORS: Record<string, string> = { whatsapp: "#22c55e", telegram: "#0ea5e9" }

export function ChannelBarChart({ data }: { data: CanalDistribuicaoItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
        <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="provider"
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v: string) => (v ? v[0].toUpperCase() + v.slice(1) : v)}
        />
        <Tooltip
          content={({ label, payload }: TooltipProps<number, string>) =>
            payload && payload.length ? (
              <TooltipCard
                label={String(label)}
                rows={[{ name: "Mensagens", value: Number(payload[0]?.value ?? 0), color: "#0d9488" }]}
              />
            ) : null
          }
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]}>
          {data.map((d) => (
            <Cell key={d.provider} fill={CHANNEL_COLORS[d.provider] ?? "#0d9488"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Atendimentos por setor
// ---------------------------------------------------------------------------

export function SectorBarChart({ data }: { data: SetorDistribuicaoItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
        <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="setor" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={80} />
        <Tooltip
          content={({ label, payload }: TooltipProps<number, string>) =>
            payload && payload.length ? (
              <TooltipCard
                label={String(label)}
                rows={[{ name: "Atendimentos", value: Number(payload[0]?.value ?? 0), color: "#f59e0b" }]}
              />
            ) : null
          }
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]} fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Horário de pico (mensagens por hora do dia)
// ---------------------------------------------------------------------------

export function PeakHoursChart({ data }: { data: PicoHorarioItem[] }) {
  const byHour = Array.from({ length: 24 }, (_, hora) => {
    const found = data.find((d) => d.hora === hora)
    return { hora, total: found?.total ?? 0 }
  })

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={byHour} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="hora"
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}h`}
          interval={2}
        />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
        <Tooltip
          content={({ label, payload }: TooltipProps<number, string>) =>
            payload && payload.length ? (
              <TooltipCard
                label={`${label}h`}
                rows={[{ name: "Mensagens", value: Number(payload[0]?.value ?? 0), color: "#0d9488" }]}
              />
            ) : null
          }
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#0d9488" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Funil de cadastro (drop-off por etapa)
// ---------------------------------------------------------------------------

export function RegistrationFunnelChart({ data }: { data: FunilCadastroEtapa[] }) {
  const max = Math.max(1, ...data.map((d) => d.total))

  return (
    <div className="space-y-2.5">
      {data.map((step, i) => {
        const pct = Math.round((step.total / max) * 100)
        const dropoff = i > 0 ? data[i - 1].total - step.total : 0
        return (
          <div key={step.etapa + i}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-600 truncate pr-2">{step.etapa}</span>
              <span className="text-zinc-800 font-medium tabular-nums shrink-0">
                {formatNumber(step.total)}
                {i > 0 && dropoff > 0 && (
                  <span className="text-rose-500 font-normal ml-1.5">-{formatNumber(dropoff)}</span>
                )}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}