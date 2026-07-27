//app/(dashboards)/layout
import {
  LayoutDashboard,
  Boxes,
  Filter,
  MessageSquare,
  Users,
  Bot,
  BookOpen,
  LogOut,
  Headset,
  Building2,
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

            {/* FUNIL DE IA */}
            <Link
              href="/dashboard/iaFunnels"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800"
            >
              <Bot size={16} />
              Funil de IA
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

            <Link
              href="/dashboard/sector"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800"
            >
              <Building2 size={16} />
              Setor
            </Link>

            <Link
              href="/dashboard/attendants"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800"
            >
              <Headset size={16} />
              Atendentes
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
      <main className="flex-1 bg-zinc-100 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}