// app/(dashboard)/dashboard/components/charts.tsx
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
import { 
  DetalheAgenteIA, 
  EvolucaoTokensItem, 
  CustoModeloItem, 
  EvolucaoCustoItem 
} from "../aipannel/lib/types" 

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

// ---------------------------------------------------------------------------
// Distribuição de Tokens 
// ---------------------------------------------------------------------------

export function AIConsumptionBarChart({ data }: { data: DetalheAgenteIA[] }) {
  const chartData = data.map((d) => ({
    agente: d.no_agente || "Desconhecido",
    tokens: Number(d.total_tokens) || 0,
    modelo: d.ds_modelo,
  }))

  return (
    <BarChart 
      data={chartData} 
      xDataKey="agente" 
      aspectRatio="3 / 1" 
      className="w-full"
    >
      <Grid 
        horizontal 
        highlightRowValues={[0]} 
        numTicksRows={4} 
        fadeHorizontal 
      />
      <Bar 
        dataKey="tokens" 
        fill="#18181b" 
        lineCap="round" 
        minBarHeight={4} 
      />
      <BarXAxis maxLabels={10} />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { 
            color: "#18181b", 
            label: "Tokens Consumidos", 
            value: formatNumber((point.tokens as number) ?? 0) 
          },
          { 
            color: "#a1a1aa", 
            label: "Modelo Utilizado", 
            value: (point.modelo as string) ?? "N/A" 
          },
        ]}
      />
    </BarChart>
  )
}

// ---------------------------------------------------------------------------
// Evolução de Tokens (Área)
// ---------------------------------------------------------------------------

export function AITokensAreaChart({ data }: { data: EvolucaoTokensItem[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.data),
    prompt: d.prompt ?? 0,
    completion: d.completion ?? 0,
  }))

  return (
    <AreaChart data={chartData} className="w-full" style={{ height: 260 }}>
      <Grid horizontal highlightRowValues={[0]} numTicksRows={4} fadeHorizontal />
      <Area
        dataKey="prompt"
        fill="#a1a1aa" 
        fillOpacity={0.15}
        strokeWidth={2}
        gradientSpan={0.9}
        fadeEdges="left"
      />
      <Area
        dataKey="completion"
        fill="#18181b" 
        fillOpacity={0.2}
        strokeWidth={2}
        gradientSpan={0.9}
        fadeEdges="left"
      />
      <XAxis />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { color: "#a1a1aa", label: "Tokens de Prompt", value: formatNumber((point.prompt as number) ?? 0) },
          { color: "#18181b", label: "Tokens de Resposta", value: formatNumber((point.completion as number) ?? 0) },
        ]}
      />
    </AreaChart>
  )
}

// ---------------------------------------------------------------------------
// Gráfico Combinado: Tokens e Custos (Eixos Y Independentes)
// ---------------------------------------------------------------------------

export function AICostVsTokensAreaChart({ data }: { data: any[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.data),
    tokensTotais: d.tokensTotais ?? 0,
    custo: d.custo ?? 0,
  }))

  return (
    <AreaChart data={chartData} className="w-full" style={{ height: 320 }}>
      <Grid horizontal highlightRowValues={[0]} numTicksRows={5} fadeHorizontal />
      
      {/* Linha de Tráfego de Tokens */}
      <Area
        dataKey="tokensTotais"
        yAxisId="left"
        fill="#a1a1aa"
        fillOpacity={0.1}
        gradientToOpacity={0}
        stroke="#a1a1aa"
        strokeWidth={2}
        fadeEdges="left"
      />
      
      {/* Linha de Custo Monetário */}
      <Area
        dataKey="custo"
        yAxisId="right"
        fill="#ff6e4a" 
        fillOpacity={0.25}
        gradientSpan={0.8}
        gradientToOpacity={0}
        stroke="#ff6e4a"
        strokeWidth={2}
        fadeEdges="left"
      />
      
      <XAxis />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { 
            color: "#ff6e4a", 
            label: "Consumo Monetário", 
            value: `$ ${((point.custo as number) ?? 0).toFixed(4)}` 
          },
          { 
            color: "#a1a1aa", 
            label: "Tokens Totais Trafegados", 
            value: formatNumber((point.tokensTotais as number) ?? 0) 
          },
        ]}
      />
    </AreaChart>
  )
}

// ---------------------------------------------------------------------------
// Gráficos Exclusivos Financeiros
// ---------------------------------------------------------------------------

export function AICostBarChart({ data }: { data: EvolucaoCustoItem[] }) {
  const chartData = data.map((d) => ({
    data: d.data, 
    custo: d.custo ?? 0,
  }))

  return (
    <BarChart data={chartData} xDataKey="data" aspectRatio="4 / 3" className="w-full h-full">
      <Grid horizontal highlightRowValues={[0]} numTicksRows={4} fadeHorizontal />
      <Bar dataKey="custo" fill="#ff6e4a" lineCap="round" minBarHeight={4} />
      <BarXAxis maxLabels={7} />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { 
            color: "#ff6e4a", 
            label: "Custo Estimado", 
            value: `$ ${((point.custo as number) ?? 0).toFixed(4)}` 
          },
        ]}
      />
    </BarChart>
  )
}

// ---------------------------------------------------------------------------
// Novo Gráfico: Custo por Agente (Corrigido para usar total_tokens)
// ---------------------------------------------------------------------------
export function AIAgentCostBarChart({ data }: { data: DetalheAgenteIA[] }) {
  const chartData = data.map((d) => {
    const tokens = Number(d.total_tokens) || 0
    // Calcula o custo com base nos tokens (ajuste a taxa por token se necessário)
    const custoCalculado = tokens * 0.000002

    return {
      agente: d.no_agente || "Desconhecido",
      custo: custoCalculado,
      modelo: d.ds_modelo,
    }
  }).sort((a, b) => b.custo - a.custo) // Ordena do mais caro para o mais barato

  return (
    <BarChart data={chartData} xDataKey="agente" aspectRatio="4 / 3" className="w-full h-full">
      <Grid horizontal highlightRowValues={[0]} numTicksRows={4} fadeHorizontal />
      <Bar dataKey="custo" fill="#ff6e4a" lineCap="round" minBarHeight={4} />
      <BarXAxis maxLabels={5} />
      <ChartTooltip
        rows={(point: Record<string, unknown>) => [
          { 
            color: "#ff6e4a", 
            label: "Custo do Agente", 
            value: `$ ${((point.custo as number) ?? 0).toFixed(4)}` 
          },
          { 
            color: "#a1a1aa", 
            label: "Modelo Utilizado", 
            value: (point.modelo as string) ?? "N/A" 
          },
        ]}
      />
    </BarChart>
  )
}

export interface ModeloTokensItem {
  modelo: string
  tokens: number
  requests: number
  custoEstimado: number
  precoConhecido: boolean
}

function formatCompactTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${value}`
}

export function AITokensPerModelDonutChart({ data }: { data: ModeloTokensItem[] }) {
  const totalTokens = data.reduce((acc, d) => acc + d.tokens, 0)
  const totalCustoEstimado = data.reduce((acc, d) => acc + d.custoEstimado, 0)

  const TOKEN_COLORS = ["#ff6e4a", "#ff9377", "#ffb4a2", "#ffd5cc", "#f4f4f5"]

  const pieData = data.map((d, index) => {
    const baseLabel = d.modelo || "Outros"
    const uniqueLabel = data.filter(item => (item.modelo || "Outros") === baseLabel).length > 1 
      ? `${baseLabel} (${index + 1})` 
      : baseLabel

    return {
      id: `${baseLabel}-${index}`,
      label: uniqueLabel,
      value: d.tokens,
      maxValue: totalTokens || 1,
      color: TOKEN_COLORS[index % TOKEN_COLORS.length],
      custoEstimado: d.custoEstimado,
      precoConhecido: d.precoConhecido,
    }
  })

  return (
    <div className="flex flex-col items-center gap-6 h-full justify-center pb-4">
      <div className="shrink-0 mt-4">
        <PieChart
          data={pieData}
          size={160}
          innerRadius={54}
          padAngle={0.03}
          cornerRadius={4}
          hoverOffset={6}
        >
          {pieData.map((item, i) => (
            <PieSlice key={item.id} index={i} />
          ))}
          <PieCenter defaultLabel="Total Tokens">
            {({ label }: { value: number; label: string }) => (
              <>
                <span className="text-lg font-semibold text-zinc-900 tabular-nums">
                  {formatCompactTokens(totalTokens)}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{label}</span>
              </>
            )}
          </PieCenter>
        </PieChart>
      </div>

      <Legend items={pieData} className="w-full max-w-[220px] space-y-2">
        <LegendItem className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 min-w-0">
            <LegendMarker className="h-2.5 w-2.5 shrink-0 rounded-sm" />
            <LegendLabel className="truncate text-xs font-medium text-zinc-700" />
          </span>
          <span className="flex flex-col items-end shrink-0">
            <LegendValue
              className="text-xs font-semibold text-zinc-900 tabular-nums"
              showPercentage
              percentageClassName="text-[10px] text-zinc-400 font-normal ml-1"
              formatValue={(v: number) => formatCompactTokens(v)}
            />
          </span>
        </LegendItem>
      </Legend>

      <p className="text-[11px] text-zinc-400 text-center px-2">
        {totalCustoEstimado > 0 
          ? `Custo estimado: ~$${totalCustoEstimado.toFixed(4)}`
          : "Custo estimado indisponível"}
        {pieData.some(p => !p.precoConhecido) && " · alguns modelos sem preço cadastrado"}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Novo Gráfico: Custo Financeiro por Modelo (Donut Chart)
// ---------------------------------------------------------------------------

export function AIModelCostDonutChart({ data }: { data: any[] }) {
  const totalCusto = data.reduce((acc, d) => acc + d.custo, 0)
  
  // Cores quentes para métricas financeiras
  const COST_COLORS = ["#ff6e4a", "#ff9377", "#ffb4a2", "#ffd5cc", "#f4f4f5"]

  const pieData = data.map((d, index) => {
    return {
      id: `${d.modelo}-${index}`,
      label: d.modelo || "Outros",
      value: d.custo,
      maxValue: totalCusto || 1,
      color: COST_COLORS[index % COST_COLORS.length],
      custoEstimado: d.custoEstimado
    }
  })

  return (
    <div className="flex flex-col items-center gap-6 h-full justify-center pb-4">
      <div className="shrink-0 mt-4">
        <PieChart
          data={pieData}
          size={160}
          innerRadius={54}
          padAngle={0.03}
          cornerRadius={4}
          hoverOffset={6}
        >
          {pieData.map((item, i) => (
            <PieSlice key={item.id} index={i} />
          ))}
          <PieCenter defaultLabel="Total Gasto">
            {({ label }: { value: number; label: string }) => (
              <>
                <span className="text-lg font-semibold text-zinc-900 tabular-nums">
                  ${totalCusto.toFixed(2)}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{label}</span>
              </>
            )}
          </PieCenter>
        </PieChart>
      </div>

      <Legend items={pieData} className="w-full max-w-[220px] space-y-2">
        <LegendItem className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 min-w-0">
            <LegendMarker className="h-2.5 w-2.5 shrink-0 rounded-sm" />
            <LegendLabel className="truncate text-xs font-medium text-zinc-700" />
          </span>
          <span className="flex flex-col items-end shrink-0">
            <LegendValue
              className="text-xs font-semibold text-zinc-900 tabular-nums"
              showPercentage
              percentageClassName="text-[10px] text-zinc-400 font-normal ml-1"
              formatValue={(v: number) => `$${v.toFixed(2)}`}
            />
          </span>
        </LegendItem>
      </Legend>

      {pieData.some(p => p.custoEstimado) && (
        <p className="text-[11px] text-orange-500 text-center px-2 font-medium">
          * Alguns modelos não possuem API Key isolada e usam custo estimado.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Novo Gráfico: Custo por Modalidade/Categoria (Donut Chart)
// ---------------------------------------------------------------------------

export function AIModalityCostDonutChart({ data }: { data: any[] }) {
  const totalCusto = data.reduce((acc, d) => acc + (d.custo || 0), 0)
  
  // Cores um pouco mais sóbrias/azuis para distinguir produtos estruturais
  const PRODUCT_COLORS = ["#2563eb", "#60a5fa", "#93c5fd", "#bfdbfe", "#f3f4f6"]

  const pieData = data.map((d, index) => {
    return {
      id: `${d.linha}-${index}`,
      label: d.linha || "Outros",
      value: d.custo || 0,
      maxValue: totalCusto || 1,
      color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
    }
  })

  return (
    <div className="flex flex-col items-center gap-6 h-full justify-center pb-4">
      <div className="shrink-0 mt-4">
        <PieChart
          data={pieData}
          size={160}
          innerRadius={54}
          padAngle={0.03}
          cornerRadius={4}
          hoverOffset={6}
        >
          {pieData.map((item, i) => (
            <PieSlice key={item.id} index={i} />
          ))}
          <PieCenter defaultLabel="Faturamento">
            {({ label }: { value: number; label: string }) => (
              <>
                <span className="text-lg font-semibold text-zinc-900 tabular-nums">
                  ${totalCusto.toFixed(2)}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{label}</span>
              </>
            )}
          </PieCenter>
        </PieChart>
      </div>

      <Legend items={pieData} className="w-full max-w-[220px] space-y-2">
        <LegendItem className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 min-w-0">
            <LegendMarker className="h-2.5 w-2.5 shrink-0 rounded-sm" />
            <LegendLabel className="truncate text-xs font-medium text-zinc-700" />
          </span>
          <span className="flex flex-col items-end shrink-0">
            <LegendValue
              className="text-xs font-semibold text-zinc-900 tabular-nums"
              showPercentage
              percentageClassName="text-[10px] text-zinc-400 font-normal ml-1"
              formatValue={(v: number) => `$${v.toFixed(2)}`}
            />
          </span>
        </LegendItem>
      </Legend>
    </div>
  )
}