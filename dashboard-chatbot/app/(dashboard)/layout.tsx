// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-zinc-900 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Chatbot Admin</h1>

        <nav className="space-y-2">
          <a href="/dashboard" className="block hover:text-blue-400">
            Visão Geral
          </a>
          <a href="/dashboard/instances" className="block hover:text-blue-400">
            Instâncias
          </a>
          <a href="/dashboard/funnels" className="block hover:text-blue-400">
            Funis
          </a>
          <a href="/dashboard/messages" className="block hover:text-blue-400">
            Mensagens
          </a>
          <a href="/dashboard/messages" className="block hover:text-blue-400">
            Contatos
          </a>
        </nav>
      </aside>

      <main className="flex-1 bg-zinc-100 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}