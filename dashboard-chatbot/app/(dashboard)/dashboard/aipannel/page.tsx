// app/(dashboard)/iapannel/page.tsx
"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Cpu,
  MessageSquare,
  Zap,
  AlertTriangle,
  RefreshCcw,
  DollarSign,
  Calendar,
  TrendingUp,
  Award
} from "lucide-react"

import { useTabs } from "../context/tabs-context"
import { DashboardIAData } from "./lib/types"
import { formatNumber } from "../lib/format"
import KpiCard from "../components/kpicard"
import ChartCard from "../components/chartcard"
import { 
  AIConsumptionBarChart, 
  AICostVsTokensAreaChart,
  AITokensPerModelDonutChart,
  AICostBarChart,
  AIAgentCostBarChart,
  AIModelCostDonutChart,
} from "../components/charts"

const MODALIDADES_BASEADAS_EM_TOKEN = ["completions", "embeddings", "moderations"]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 6 && hour <= 12) return "Bom dia"
  if (hour >= 13 && hour <= 18) return "Boa tarde"
  if (hour >= 19 && hour <= 23) return "Boa noite"
  return "Boa madrugada"
}

export default function PainelIAPage() {
  const { openTab } = useTabs()
  const [greeting, setGreeting] = useState("Olá")
  const [data, setData] = useState<DashboardIAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const defaultEnd = new Date().toISOString().split('T')[0]
  const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)

  const handleAbrirFunis = () => {
    openTab({
      registryKey: "ia",
      key: "ia",
      label: "IA",
      closable: true,
    })
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/painelia?start=${startDate}&end=${endDate}`)
      if (!res.ok) throw new Error("Falha ao carregar o dashboard de IA")
      const json = await res.json()
      
      if(json.success) {
        setData(json.data)
      } else {
        throw new Error("Erro no retorno dos dados")
      }
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar os dados de consumo de IA agora.")
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    setGreeting(getGreeting())
    fetchData()
  }, [fetchData])

  return (
    <div className="p-6 space-y-8 bg-white min-h-screen text-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monitoramento de IA</h1>
          <p className="text-sm text-zinc-500 mt-1">{greeting}, aqui está o consumo da OpenAI.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700">
            <Calendar size={14} className="text-zinc-500" />
            <input 
              type="date" 
              value={startDate} 
              max={endDate}
              onChange={(e) => {
                if (e.target.value < endDate) setStartDate(e.target.value)
              }}
              className="bg-transparent outline-none cursor-pointer"
            />
            <span>até</span>
            <input 
              type="date" 
              value={endDate} 
              min={startDate}
              onChange={(e) => {
                if (e.target.value > startDate) setEndDate(e.target.value)
              }}
              className="bg-transparent outline-none cursor-pointer"
            />
          </div>


          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
          <button
            onClick={handleAbrirFunis}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-3 rounded-xl flex items-center gap-2 font-medium shadow-sm"
          >
            Ir para funis de IA
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-zinc-100 border border-zinc-300 text-zinc-800 text-sm rounded-xl px-4 py-3">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={fetchData} className="ml-auto font-medium underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      )}

      {loading || !data ? <DashboardSkeleton /> : <PainelIAContent data={data} />}
    </div>
  )
}

function PainelIAContent({ data }: { data: any }) { // Usando 'any' temporário para os novos campos, idealmente atualize seu types.ts
  const { 
    totais, 
    detalhesAgentes = [], 
    evolucaoTokens = [], 
    custosPorModelo = [], 
    evolucaoCustos = [],
    custoPorModalidade = [],
    modeloMaisGasta = null
  } = data

  const evolucaoCombinada = evolucaoTokens.map((tokenData: any) => {
    const custoMatch = evolucaoCustos.find((c: any) => c.data === tokenData.data)
    return {
      data: tokenData.data,
      tokensTotais: (tokenData.prompt || 0) + (tokenData.completion || 0),
      custo: Number(custoMatch?.custo) || 0
    }
  })

  const custoTotal = evolucaoCustos.reduce((acc: number, curr: any) => {
    const valor = Number(curr.custo)
    return acc + (Number.isFinite(valor) ? valor : 0)
  }, 0)

  // 1. Agrupamento de TOKENS (Antigo, mantido intacto)
  const consumoPorModeloTokens = useMemo(() => {
    const mapa = new Map<string, any>()
    custosPorModelo
      .filter((item: any) => MODALIDADES_BASEADAS_EM_TOKEN.includes(item.modalidade))
      .forEach((item: any) => {
        const atual = mapa.get(item.modelo) ?? {
          modelo: item.modelo,
          tokens: 0,
          requests: 0,
        }
        atual.tokens += item.unidadePrincipal || 0
        atual.requests += item.requests || 0
        mapa.set(item.modelo, atual)
      })
    return Array.from(mapa.values()).sort((a, b) => b.tokens - a.tokens)
  }, [custosPorModelo])

  // 2. NOVA ANÁLISE: Agrupamento FINANCEIRO por Modelo (Mistura Real e Estimado)
  const custoPorModeloFinanceiro = useMemo(() => {
    const mapa = new Map<string, any>()
    custosPorModelo.forEach((item: any) => {
      const atual = mapa.get(item.modelo) ?? {
        modelo: item.modelo,
        custo: 0,
        custoEstimado: false // Começamos assumindo que é real, se alguma modalidade for estimada, vira true
      }
      atual.custo += item.custo || 0
      if (item.custoEstimado) atual.custoEstimado = true
      mapa.set(item.modelo, atual)
    })
    return Array.from(mapa.values()).sort((a, b) => b.custo - a.custo)
  }, [custosPorModelo])

  return (
    <div className="space-y-8">
      {/* Linha 1: KPIs Rápidos */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Tokens Totais"
          value={formatNumber(totais?.total_geral || 0)}
          subtitle="Trafegados na plataforma"
          icon={Zap}
          accent="zinc"
        />
        <KpiCard
          title="Gasto Financeiro Real"
          value={`$${Number.isFinite(custoTotal) ? custoTotal.toFixed(2) : "0.00"}`}
          subtitle="Cobrado pela OpenAI"
          icon={DollarSign}
          accent="zinc"
        />
        <KpiCard
          title="Modelo Mais Custoso"
          value={modeloMaisGasta?.modelo || "N/A"}
          subtitle={`Gasto de $${(modeloMaisGasta?.custo || 0).toFixed(2)}`}
          icon={TrendingUp}
          accent="zinc"
        />
        <KpiCard
          title="Principal Gasto"
          value={custoPorModalidade[0]?.linha || "N/A"}
          subtitle="Produto que mais consumiu"
          icon={Award}
          accent="zinc"
        />
      </section>

      <hr className="border-zinc-200" />

      {/* Visão Unificada: Volumetria vs Custo */}
      <section className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Comparativo: Uso de Tokens vs Gasto Financeiro"
          subtitle="Acompanhamento diário correlacionando o tráfego de dados com o impacto monetário"
          isEmpty={evolucaoCombinada.length === 0}
        >
          <AICostVsTokensAreaChart data={evolucaoCombinada} />
        </ChartCard>
      </section>

      <hr className="border-zinc-200" />

      {/* Seção Exclusiva: Análise Financeira */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Análise Financeira Detalhada (Custos Reais)</h2>
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-2">
            <ChartCard
              title="Custo Diário"
              subtitle="Evolução do faturamento (valor real da API)"
              isEmpty={evolucaoCustos.length === 0}
            >
              <AICostBarChart data={evolucaoCustos} />
            </ChartCard>
          </div>
          
          <div className="xl:col-span-1">
            <ChartCard
              title="Custo por Modelo ($)"
              subtitle="Modelos que mais pesam na fatura"
              isEmpty={custoPorModeloFinanceiro.length === 0}
            >
              <AIModelCostDonutChart data={custoPorModeloFinanceiro} />
            </ChartCard>
          </div>
        </section>
      </div>

      <hr className="border-zinc-200" />

      {/* Seção Exclusiva: Análise de Volumetria (Tokens) */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Distribuição de Tokens e Funis</h2>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ChartCard
              title="Consumo por Modelo (Tokens)"
              subtitle="Quais IA geram maior volume de tráfego"
              isEmpty={consumoPorModeloTokens.length === 0}
            >
              <AITokensPerModelDonutChart data={consumoPorModeloTokens} />
            </ChartCard>
          </div>

          <div className="lg:col-span-2">
            <ChartCard
              title="Consumo por Agente (Tokens)"
              subtitle="Distribuição de tokens gastos por ia"
              isEmpty={detalhesAgentes.length === 0}
            >
              <AIConsumptionBarChart data={detalhesAgentes} />
            </ChartCard>
          </div>
        </section>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-zinc-100 rounded-2xl border border-zinc-200 h-28" />
        ))}
      </div>
      <div className="bg-zinc-100 rounded-2xl border border-zinc-200 h-80" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-zinc-100 rounded-2xl border border-zinc-200 h-80" />
        ))}
      </div>
    </div>
  )
}