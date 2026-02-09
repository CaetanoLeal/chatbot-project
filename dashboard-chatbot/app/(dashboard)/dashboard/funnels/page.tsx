export default function FunnelsPage() {
  const funnels = [
    {
      id: "1",
      name: "Funil de Vendas",
      description: "Conversão de leads via WhatsApp",
      messagesCount: 12,
      usersCount: 154,
      createdAt: "01/02/2026",
    },
    {
      id: "2",
      name: "Funil de Suporte",
      description: "Atendimento automático ao cliente",
      messagesCount: 8,
      usersCount: 87,
      createdAt: "28/01/2026",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-700">
          Funis
        </h1>

        <a
          href="/dashboard/funnels/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          Criar novo funil
        </a>
      </div>

      {/* Lista de funis */}
      <div className="space-y-4">
        {funnels.map((funil) => (
          <div
            key={funil.id}
            className="bg-white rounded shadow p-5 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-700">
                  {funil.name}
                </h2>
                <p className="text-sm text-zinc-500">
                  {funil.description}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/dashboard/funnels/${funil.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Editar
                </a>
                <button className="text-red-600 text-sm hover:underline">
                  Deletar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-zinc-600">
              <span>📨 {funil.messagesCount} mensagens</span>
              <span>👥 {funil.usersCount} utilizadores</span>
              <span>Criado em: {funil.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}