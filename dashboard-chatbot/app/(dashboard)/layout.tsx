// app/(dashboards)/layout.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Bot,
  Sparkles,
  Headset,
  Users,
  Filter,
  MessageSquare,
  Building2,
  Boxes,
  Inbox,
  History,
  BookOpen,
  LogOut,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

/* ============================================================
   TIPOS
   ============================================================ */
type NavLeaf = {
  type: "link"
  label: string
  href: string
  icon: React.ElementType
}

type NavGroup = {
  type: "group"
  label: string
  icon: React.ElementType
  items: { label: string; href: string; icon: React.ElementType }[]
}

type NavItem = NavLeaf | NavGroup

/* ============================================================
   ESTRUTURA DO MENU
   ============================================================ */
const NAV_ITEMS: NavItem[] = [
  { type: "link", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { type: "link", label: "Painel IA", href: "/dashboard/aipannel", icon: Bot },
  {
    type: "group",
    label: "Cadastro",
    icon: Boxes,
    items: [
      { label: "Atendente", href: "/dashboard/attendants", icon: Headset },
      { label: "Contato", href: "/dashboard/contacts", icon: Users },
      { label: "Funil", href: "/dashboard/funnels", icon: Filter },
      { label: "IA", href: "/dashboard/aipannel/aifunnels", icon: Sparkles },
      { label: "Msg Predefinida", href: "/dashboard/shortcuts", icon: Inbox },
      { label: "Setor", href: "/dashboard/sector", icon: Building2 },
    ],
  },
  {
    type: "group",
    label: "Chat",
    icon: MessageSquare,
    items: [
      { label: "Atendimento", href: "/dashboard/messages", icon: MessageSquare },
      { label: "Histórico", href: "/dashboard/history", icon: History },
      { label: "Instância", href: "/dashboard/instances", icon: Boxes },
    ],
  },
]

const BOTTOM_ITEMS: NavLeaf[] = [
  { type: "link", label: "Documentação", href: "/dashboard/coming", icon: BookOpen },
  { type: "link", label: "Sair", href: "/dashboard/coming", icon: LogOut },
]

const SIDEBAR_STORAGE_KEY = "painel:sidebar_colapsada"
const GROUPS_STORAGE_KEY = "painel:sidebar_grupos_abertos"

/* ============================================================
   HELPERS
   ============================================================ */
function isGroupActive(group: NavGroup, pathname: string) {
  return group.items.some((item) => pathname.startsWith(item.href))
}

/* ============================================================
   LAYOUT
   ============================================================ */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // grupos abrem automaticamente se a rota atual pertence a eles
    const initial: Record<string, boolean> = {}
    for (const item of NAV_ITEMS) {
      if (item.type === "group") {
        initial[item.label] = isGroupActive(item, pathname)
      }
    }
    return initial
  })

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev
      if (typeof window !== "undefined") localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] }
      if (typeof window !== "undefined") localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(next))
      return next
    })
    // se a sidebar estiver colapsada, expandir ao abrir um grupo
    if (collapsed) setCollapsed(false)
  }

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } shrink-0 bg-zinc-900 text-white flex flex-col justify-between transition-[width] duration-200 ease-in-out overflow-hidden`}
      >
        <div className="p-3">
          {/* HEADER + TOGGLE */}
          <div className={`flex items-center mb-6 ${collapsed ? "justify-center" : "justify-between px-1"}`}>
            {!collapsed && (
              <h1 className="text-lg font-bold whitespace-nowrap">Chatbot Admin</h1>
            )}
            <button
              onClick={toggleSidebar}
              title={collapsed ? "Expandir menu" : "Recolher menu"}
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white shrink-0"
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* NAV */}
          <nav className="space-y-1 text-sm">
            {NAV_ITEMS.map((item) => {
              if (item.type === "link") {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2 px-2 py-2 rounded transition-colors ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <item.icon size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              }

              // GRUPO
              const groupActive = isGroupActive(item, pathname)
              const open = !!openGroups[item.label]

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded transition-colors ${
                      collapsed ? "justify-center" : "justify-between"
                    } ${
                      groupActive
                        ? "text-white"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <item.icon size={16} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </span>
                    {!collapsed &&
                      (open ? (
                        <ChevronDown size={14} className="shrink-0 text-zinc-500" />
                      ) : (
                        <ChevronRight size={14} className="shrink-0 text-zinc-500" />
                      ))}
                  </button>

                  {/* SUBITENS */}
                  {!collapsed && open && (
                    <div className="mt-1 ml-3 pl-3 border-l border-zinc-800 space-y-1">
                      {item.items.map((sub) => {
                        const active = pathname.startsWith(sub.href)
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                              active
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            }`}
                          >
                            <sub.icon size={14} className="shrink-0" />
                            <span className="truncate">{sub.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="p-3 border-t border-zinc-800 space-y-1 text-sm">
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800 transition-colors ${
                collapsed ? "justify-center" : ""
              } ${item.label === "Sair" ? "text-red-400 hover:text-red-300" : "text-zinc-300"}`}
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 bg-zinc-100 overflow-y-auto">{children}</main>
    </div>
  )
}