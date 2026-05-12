"use client"

import { useEffect, useState } from "react"

function getGreeting() {
  const hour = new Date().getHours()

  if (hour >= 6 && hour <= 12) return "Bom dia"
  if (hour >= 13 && hour <= 18) return "Boa tarde"
  if (hour >= 19 && hour <= 23) return "Boa noite"
  return "Boa madrugada"
}

export default function DashboardPage() {
  const greeting = getGreeting()

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("http://45.228.143.12:3001/api/dashboard")
      .then(res => res.json())
      .then(res => setData(res))
  }, [])

  if (!data) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-700">
            Visão Geral
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {greeting}, Seja bem vindo
          </p>
        </div>

        <select className="border rounded px-3 py-2 text-sm text-zinc-500 font-bold">
          <option>Hoje</option>
          <option>Este mês</option>
          <option>Este ano</option>
        </select>
      </div>

      {/* RELATÓRIO */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-700">
          Relatório de Atendimento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Atendimentos realizados"
            value={data.atendimentos}
          />
          <DashboardCard
            title="Mensagens recebidas"
            value={data.mensagens}
          />
        </div>
      </section>

      {/* INSTÂNCIAS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-700">
          Dados de Instâncias
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Instâncias ativas"
            value={data.instanciasAtivas}
          />
          <DashboardCard
            title="Instância mais ativa"
            value={
              data.instanciaMaisAtiva
                ? `${data.instanciaMaisAtiva.no_instancia} (${data.instanciaMaisAtiva.total})`
                : "Nenhuma"
            }
          />
        </div>
      </section>

      {/* FUNIS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-700">
          Dados de Funis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Funis criados"
            value={data.funis}
          />
          <DashboardCard
            title="Funil mais utilizado"
            value={
              data.funilMaisUsado
                ? `${data.funilMaisUsado.no_funil} (${data.funilMaisUsado.total})`
                : "Nenhum"
            }
          />
        </div>
      </section>
    </div>
  )
}

function DashboardCard({
  title,
  value,
}: {
  title: string
  value: any
}) {
  return (
    <div className="bg-white rounded shadow p-4">
      <p className="text-sm text-zinc-900">{title}</p>
      <p className="text-2xl font-bold mt-2 text-zinc-400">{value}</p>
    </div>
  )
}