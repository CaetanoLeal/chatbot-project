"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Users,
  MessageCircleMore,
  Send,
  CheckCircle2,
  UserPlus,
  TrendingUp,
  Clock,
  Radio,
  AlertTriangle,
} from "lucide-react"

import { DashboardData, Period } from "./lib/types"
import { formatMinutes, formatNumber, formatPercent } from "./lib/format"
import KpiCard from "./components/kpicard"
import ChartCard from "./components/chartcard"
import {
  MessagesTimelineChart,
  AttendanceTimelineChart,
  StatusDonutChart,
  ChannelBarChart,
  SectorBarChart,
  PeakHoursChart,
  RegistrationFunnelChart,
} from "./components/charts"
import { TopFunnelsList, TopInstancesList } from "./components/rankingcards"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 6 && hour <= 12) return "Bom dia"
  if (hour >= 13 && hour <= 18) return "Boa tarde"
  if (hour >= 19 && hour <= 23) return "Boa noite"
  return "Boa madrugada"
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "month", label: "Este mês" },
  { value: "year", label: "Este ano" },
]

export default function DashboardPage() {
  // 1. Inicializa o estado com uma string padrão para evitar discrepância SSR vs Cliente
  const [greeting, setGreeting] = useState("Olá")
  const [period, setPeriod] = useState<Period>("month")
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard?period=${p}`)
      if (!res.ok) throw new Error("Falha ao carregar o dashboard")
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar os dados agora.")
    } finally {
      setLoading(false)
    }
  }, [])

  // 2. Define a saudação dinamicamente assim que o componente monta no navegador
  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  return (
    <div className="p-6 space-y-8 bg-zinc-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-800 tracking-tight">Visão Geral</h1>
          <p className="text-sm text-zinc-500 mt-1">{greeting}, seja bem-vindo</p>
        </div>

        <div className="inline-flex items-center bg-white border border-zinc-200 rounded-xl p-1 gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                period === p.value ? "bg-teal-600 text-white" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-xl px-4 py-3">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={() => fetchData(period)} className="ml-auto font-medium underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      )}

      {loading || !data ? <DashboardSkeleton /> : <DashboardContent data={data} />}
    </div>
  )
}

function DashboardContent({ data }: { data: DashboardData }) {
  const { kpis, charts, rankings, funilCadastro, period } = data

  return (
    <>
      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Atendimentos"
          value={formatNumber(kpis.atendimentos.total)}
          variacao={kpis.atendimentos.variacao}
          icon={Users}
          accent="violet"
        />
        <KpiCard
          title="Mensagens recebidas"
          value={formatNumber(kpis.mensagensRecebidas.total)}
          variacao={kpis.mensagensRecebidas.variacao}
          icon={MessageCircleMore}
          accent="teal"
        />
        <KpiCard
          title="Mensagens enviadas"
          value={formatNumber(kpis.mensagensEnviadas.total)}
          variacao={kpis.mensagensEnviadas.variacao}
          icon={Send}
          accent="sky"
        />
        <KpiCard
          title="Taxa de finalização"
          value={formatPercent(kpis.taxaFinalizacao.total)}
          subtitle="atendimentos concluídos"
          icon={CheckCircle2}
          accent="emerald"
        />
        <KpiCard
          title="Novos cadastros"
          value={formatNumber(kpis.novosCadastros.total)}
          variacao={kpis.novosCadastros.variacao}
          icon={UserPlus}
          accent="amber"
        />
        <KpiCard
          title="Conversão de cadastro"
          value={formatPercent(kpis.taxaConversaoCadastro.total)}
          variacao={kpis.taxaConversaoCadastro.variacao}
          icon={TrendingUp}
          accent="violet"
        />
        <KpiCard
          title="Tempo médio de atendimento"
          value={formatMinutes(kpis.tempoMedioAtendimento.minutos)}
          icon={Clock}
          accent="zinc"
        />
        <KpiCard
          title="Instâncias ativas"
          value={`${kpis.instancias.ativas}/${kpis.instancias.total}`}
          subtitle={`${kpis.funis.total} funis criados`}
          icon={Radio}
          accent="sky"
        />
      </section>

      {/* Mensagens ao longo do tempo + status */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Mensagens ao longo do tempo"
          subtitle="Recebidas x enviadas"
          className="lg:col-span-2"
          isEmpty={charts.mensagensTimeline.length === 0}
        >
          <MessagesTimelineChart data={charts.mensagensTimeline} period={period} />
        </ChartCard>

        <ChartCard
          title="Atendimentos por status"
          isEmpty={charts.statusDistribuicao.every((s) => s.total === 0)}
        >
          <StatusDonutChart data={charts.statusDistribuicao} />
        </ChartCard>
      </section>

      {/* Atendimentos no tempo + horário de pico */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Atendimentos criados"
          subtitle="Novos atendimentos por período"
          isEmpty={charts.atendimentosTimeline.length === 0}
        >
          <AttendanceTimelineChart data={charts.atendimentosTimeline} period={period} />
        </ChartCard>

        <ChartCard
          title="Horário de pico"
          subtitle="Mensagens por hora do dia"
          isEmpty={charts.picoHorario.length === 0}
        >
          <PeakHoursChart data={charts.picoHorario} />
        </ChartCard>
      </section>

      {/* Canal + setor */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Mensagens por canal" isEmpty={charts.canalDistribuicao.every((c) => c.total === 0)}>
          <ChannelBarChart data={charts.canalDistribuicao} />
        </ChartCard>

        <ChartCard title="Atendimentos por setor" isEmpty={charts.setorDistribuicao.every((s) => s.total === 0)}>
          <SectorBarChart data={charts.setorDistribuicao} />
        </ChartCard>
      </section>

      {/* Funil de cadastro + rankings */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Funil de cadastro"
          subtitle="Queda de utilizadores por etapa"
          isEmpty={funilCadastro.length === 0}
        >
          <RegistrationFunnelChart data={funilCadastro} />
        </ChartCard>

        <div className="grid grid-cols-1 gap-4">
          <ChartCard title="Funis mais utilizados" isEmpty={rankings.topFunis.length === 0}>
            <TopFunnelsList data={rankings.topFunis} />
          </ChartCard>

          <ChartCard title="Instâncias mais ativas" isEmpty={rankings.topInstancias.length === 0}>
            <TopInstancesList data={rankings.topInstancias} />
          </ChartCard>
        </div>
      </section>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-200 h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-200 h-72 lg:col-span-2" />
        <div className="bg-white rounded-2xl border border-zinc-200 h-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-200 h-56" />
        <div className="bg-white rounded-2xl border border-zinc-200 h-56" />
      </div>
    </div>
  )
}