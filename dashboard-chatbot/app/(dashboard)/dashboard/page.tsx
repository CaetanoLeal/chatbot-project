function getGreeting() {
  const hour = new Date().getHours()

  if (hour >= 6 && hour <= 12) return "Bom dia"
  if (hour >= 13 && hour <= 18) return "Boa tarde"
  if (hour >= 19 && hour <= 23) return "Boa noite"
  return "Boa madrugada"
}

export default function DashboardPage() {
  const greeting = getGreeting()

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-700">
            Visão Geral
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {greeting} (nome do usuario), Seja bem vindo
          </p>
        </div>

        <select className="border rounded px-3 py-2 text-sm">
          <option>Hoje</option>
          <option>Este mês</option>
          <option>Este ano</option>
        </select>
      </div>

      {/* RELATÓRIO DE ATENDIMENTO */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-700">
          Relatório de Atendimento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Atendimentos realizados"
            value="120"
          />
          <DashboardCard
            title="Mensagens recebidas"
            value="1.245"
          />
        </div>

        <div className="bg-white rounded shadow p-6 text-center text-zinc-400">
          Espaço reservado para gráfico de atendimentos
        </div>
      </section>

      {/* DADOS DE INSTÂNCIAS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-700">
          Dados de Instâncias
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Instâncias ativas"
            value="3"
          />
          <DashboardCard
            title="Instância mais ativa"
            value="WhatsApp - 55****1234"
          />
        </div>
      </section>

      {/* FUNIS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-700">
            Dados de Funis
          </h2>

          <a
            href="/funnels"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            <span className="text-lg leading-none">+</span>
            Criar novo funil
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Funis criados"
            value="5"
          />
          <DashboardCard
            title="Funil com maior conversão"
            value="Funil de Vendas (42%)"
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
  value: string
}) {
  return (
    <div className="bg-white rounded shadow p-4">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}