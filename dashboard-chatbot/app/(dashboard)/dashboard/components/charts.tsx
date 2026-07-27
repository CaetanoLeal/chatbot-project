//app/(dashboard)/dashboard/components/charts.tsx
"use client"

import { AreaChart, Area } from "@/components/charts/area-chart"
import { LineChart } from "@/components/charts/line-chart"
import { Line } from "@/components/charts/line"
import { BarChart } from "@/components/charts/bar-chart"
import { Bar } from "@/components/charts/bar"
import { BarXAxis } from "@/components/charts/bar-x-axis"
import { BarYAxis } from "@/components/charts/bar-y-axis"
import { PieChart } from "@/components/charts/pie-chart"
import { PieSlice } from "@/components/charts/pie-slice"
import { PieCenter } from "@/components/charts/pie-center"
import { FunnelChart, type FunnelStage } from "@/components/charts/funnel-chart"
import { Grid } from "@/components/charts/grid"
import { XAxis } from "@/components/charts/x-axis"
import { ChartTooltip } from "@/components/charts/tooltip"
import {
  Legend,
  LegendItem,
  LegendMarker,
  LegendLabel,
  LegendValue,
} from "@/components/charts/legend"
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
import { formatNumber } from "../lib/format"

// ---------------------------------------------------------------------------
// Mensagens recebidas x enviadas ao longo do tempo
// ---------------------------------------------------------------------------

export function MessagesTimelineChart({ data, period }: { data: TimelinePoint[]; period: Period }) {
  const chartData = data.map((d) => ({
    date: new Date(d.data),
    recebidas: d.recebidas ?? 0,
    enviadas: d.enviadas ?? 0,
  }))

  return (
    <AreaChart data={chartData} className="w-full" style={{ height: 260 }}>
      <Grid horizontal highlightRowValues={[0]} numTicksRows={4} fadeHorizontal />
      <Area
        dataKey="recebidas"
        fill="#0d9488"
        fillOpacity={0.28}
        strokeWidth={2}
        gradientSpan={0.9}
        fadeEdges="left"
      />
      <Area
        dataKey="enviadas"
        fill="#0ea5e9"
        fillOpacity={0.2}
        strokeWidth={2}
        gradientSpan={0.9}
        fadeEdges="left"
      />
      <XAxis />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { color: "#0d9488", label: "Recebidas", value: formatNumber((point.recebidas as number) ?? 0) },
          { color: "#0ea5e9", label: "Enviadas", value: formatNumber((point.enviadas as number) ?? 0) },
        ]}
      />
    </AreaChart>
  )
}

// ---------------------------------------------------------------------------
// Atendimentos criados ao longo do tempo
// ---------------------------------------------------------------------------

export function AttendanceTimelineChart({ data, period }: { data: TimelinePoint[]; period: Period }) {
  const chartData = data.map((d) => ({
    date: new Date(d.data),
    total: d.total ?? 0,
  }))

  return (
    <LineChart data={chartData} className="w-full" style={{ height: 220 }}>
      <Grid horizontal highlightRowValues={[0]} numTicksRows={4} />
      <Line dataKey="total" stroke="#6366f1" strokeWidth={2} />
      <XAxis />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { color: "#6366f1", label: "Atendimentos", value: formatNumber((point.total as number) ?? 0) },
        ]}
      />
    </LineChart>
  )
}

// ---------------------------------------------------------------------------
// Distribuição de atendimentos por status (donut segmentado)
// ---------------------------------------------------------------------------

export function StatusDonutChart({ data }: { data: StatusDistribuicaoItem[] }) {
  const total = data.reduce((acc, d) => acc + d.total, 0)

  const pieData = data.map((d) => ({
    label: d.status,
    value: d.total,
    maxValue: total || 1,
    color: STATUS_COLORS[d.codigo] ?? "#d4d4d8",
  }))

  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <PieChart
          data={pieData}
          size={140}
          innerRadius={46}
          padAngle={0.028}
          cornerRadius={6}
          hoverOffset={8}
        >
          {pieData.map((_, i) => (
            <PieSlice key={i} index={i} />
          ))}
          <PieCenter defaultLabel="atendimentos">
            {({ value, label }: { value: number; label: string }) => (
              <>
                <span className="text-lg font-semibold text-zinc-900 tabular-nums">
                  {formatNumber(value)}
                </span>
                <span className="text-[10px] text-zinc-400">{label}</span>
              </>
            )}
          </PieCenter>
        </PieChart>
      </div>

      <Legend items={pieData} className="flex-1 min-w-0 space-y-1">
        <LegendItem className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 min-w-0">
            <LegendMarker className="h-2 w-2 shrink-0" />
            <LegendLabel className="truncate text-xs font-normal text-zinc-600" />
          </span>
          <LegendValue
            className="text-xs font-medium text-zinc-800 tabular-nums shrink-0"
            showPercentage
            percentageClassName="text-[10px] text-zinc-400"
            formatValue={(v: number) => formatNumber(v)}
          />
        </LegendItem>
      </Legend>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mensagens por canal (whatsapp x telegram)
// ---------------------------------------------------------------------------

const CHANNEL_LABELS: Record<string, string> = { whatsapp: "Whatsapp", telegram: "Telegram" }

export function ChannelBarChart({ data }: { data: CanalDistribuicaoItem[] }) {
  const chartData = data.map((d) => ({
    provider: CHANNEL_LABELS[d.provider] ?? d.provider,
    total: d.total,
  }))

  return (
    <BarChart data={chartData} xDataKey="provider" orientation="horizontal" aspectRatio="3 / 1" className="w-full">
      <Grid vertical />
      <Bar dataKey="total" fill="#0d9488" lineCap="round" minBarHeight={4} />
      <BarYAxis />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { color: "#0d9488", label: "Mensagens", value: formatNumber((point.total as number) ?? 0) },
        ]}
      />
    </BarChart>
  )
}

// ---------------------------------------------------------------------------
// Atendimentos por setor
// ---------------------------------------------------------------------------

export function SectorBarChart({ data }: { data: SetorDistribuicaoItem[] }) {
  const chartData = data.map((d) => ({ setor: d.setor, total: d.total }))

  return (
    <BarChart data={chartData} xDataKey="setor" orientation="horizontal" aspectRatio="3 / 1" className="w-full">
      <Grid vertical />
      <Bar dataKey="total" fill="#f59e0b" lineCap="round" minBarHeight={4} />
      <BarYAxis />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { color: "#f59e0b", label: "Atendimentos", value: formatNumber((point.total as number) ?? 0) },
        ]}
      />
    </BarChart>
  )
}

// ---------------------------------------------------------------------------
// Horário de pico (mensagens por hora do dia)
// ---------------------------------------------------------------------------

export function PeakHoursChart({ data }: { data: PicoHorarioItem[] }) {
  const byHour = Array.from({ length: 24 }, (_, hora) => {
    const found = data.find((d) => d.hora === hora)
    return { hora: `${hora}h`, total: found?.total ?? 0 }
  })

  const avg = byHour.reduce((acc, d) => acc + d.total, 0) / byHour.length

  return (
    <BarChart data={byHour} xDataKey="hora" aspectRatio="3 / 1" className="w-full">
      <Grid
        horizontal
        highlightRowValues={[Math.round(avg)]}
        highlightRowStrokeDasharray="3,3"
        numTicksRows={4}
      />
      <Bar dataKey="total" fill="#0d9488" lineCap="round" minBarHeight={2} />
      <BarXAxis maxLabels={12} />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { color: "#0d9488", label: "Mensagens", value: formatNumber((point.total as number) ?? 0) },
        ]}
      />
    </BarChart>
  )
}

// ---------------------------------------------------------------------------
// Funil de cadastro (drop-off por etapa)
// ---------------------------------------------------------------------------

export function RegistrationFunnelChart({ data }: { data: FunilCadastroEtapa[] }) {
  const funnelData: FunnelStage[] = data.map((step) => ({
    label: step.etapa,
    value: step.total,
    displayValue: formatNumber(step.total),
    gradient: [
      { offset: "0%", color: "#0d9488" },
      { offset: "100%", color: "#0ea5e9" },
    ],
  }))

  return (
    <FunnelChart
      data={funnelData}
      orientation="vertical"
      showPercentage
      showValues
      showLabels
      labelLayout="grouped"
      labelOrientation="horizontal"
      edges="curved"
      gap={6}
      grid={{ bands: true, lines: true }}
      formatValue={(v: number) => formatNumber(v)}
    />
  )
}