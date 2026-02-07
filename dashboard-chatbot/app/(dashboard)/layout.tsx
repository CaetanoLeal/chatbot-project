import {
  LayoutDashboard,
  Boxes,
  Filter,
  MessageSquare,
  Users,
  Bot,
  BookOpen,
  LogOut,
} from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col justify-between">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-6">
            Chatbot Admin
          </h1>

          <nav className="space-y-1 text-sm">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800"
            >
              <LayoutDashboard size={16} />
              Visão Geral
            </Link>

            <Link
              href="/dashboard/instances"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800"
            >
              <Boxes size={16} />
              Instâncias
            </Link>

            <Link
              href="/dashboard/funnels"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800"
            >
              <Filter size={16} />
              Funis
            </Link>

            {/* FUNIL DE IA — EM BREVE */}
            <Link
              href="/dashboard/coming"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800 text-zinc-300"
            >
              <Bot size={16} />
              Funil de IA
              <span className="ml-auto text-[10px] bg-zinc-700 px-2 py-0.5 rounded">
                em breve
              </span>
            </Link>

            <Link
              href="/dashboard/messages"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800"
            >
              <MessageSquare size={16} />
              Mensagens
            </Link>

            <Link
              href="/dashboard/contacts"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800"
            >
              <Users size={16} />
              Contatos
            </Link>
          </nav>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="p-4 border-t border-zinc-800 space-y-2 text-sm">
          <Link
            href="/dashboard/coming"
            className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800 text-zinc-300"
          >
            <BookOpen size={16} />
            Documentação API
          </Link>

          <Link
            href="/dashboard/coming"
            className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800 text-red-400"
          >
            <LogOut size={16} />
            Sair
          </Link>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 bg-zinc-100 overflow-hidden">
        {children}
      </main>
    </div>
  )
}