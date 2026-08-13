// app/(dashboard)/layout.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
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

import { TabsProvider, useTabs } from "./dashboard/context/tabs-context"
import TabsHost from "./dashboard/components/tabsHost"

/* ============================================================
   TIPOS
   ============================================================ */
type NavLeaf = {
  type: "link"
  label: string
  registryKey: string
  icon: React.ElementType
  params?: Record<string, any>
}

type NavGroup = {
  type: "group"
  label: string
  icon: React.ElementType
  items: { label: string; registryKey: string; icon: React.ElementType; params?: Record<string, any> }[]
}

type NavItem = NavLeaf | NavGroup

/* ============================================================
   ESTRUTURA DO MENU
   registryKey aponta pra chave do TAB_REGISTRY (ver tab-registry.tsx).
   Itens de um mesmo grupo que abrem a MESMA aba (ex: Cadastro) usam o
   mesmo registryKey — o que muda é o "params", que a própria tela lê
   pra saber em qual sub-aba abrir.
   ============================================================ */
const NAV_ITEMS: NavItem[] = [
  { type: "link", label: "Dashboard", registryKey: "dashboard", icon: LayoutDashboard },
  { type: "link", label: "Painel IA", registryKey: "aipannel", icon: Bot },
  {
    type: "group",
    label: "Cadastro",
    icon: Boxes,
    items: [
      { label: "Atendente", registryKey: "atendente", icon: Headset },
      { label: "Contato", registryKey: "contato", icon: Users },
      { label: "Funil", registryKey: "funil", icon: Filter },
      { label: "IA", registryKey: "ia", icon: Sparkles },
      { label: "Msg Predefinida", registryKey: "atalho", icon: Inbox },
      { label: "Setor", registryKey: "setor", icon: Building2 },
    ],
  },
  {
    type: "group",
    label: "Chat",
    icon: MessageSquare,
    items: [
      { label: "Atendimento", registryKey: "atendimento", icon: MessageSquare },
      { label: "Histórico", registryKey: "historico", icon: History },
      { label: "Instância", registryKey: "instancias", icon: Boxes },
    ],
  },
]

// Itens que não fazem parte do sistema de abas (ainda não têm tela/registry) — continuam navegação normal.
const BOTTOM_ITEMS: { label: string; href: string; icon: React.ElementType }[] = [
  { label: "Documentação", href: "/dashboard/coming", icon: BookOpen },
  { label: "Sair", href: "/dashboard/coming", icon: LogOut },
]

const SIDEBAR_STORAGE_KEY = "painel:sidebar_colapsada"
const GROUPS_STORAGE_KEY = "painel:sidebar_grupos_abertos"

/* ============================================================
   HELPERS
   ============================================================ */
function isGroupActive(group: NavGroup, activeKey: string) {
  return group.items.some((item) => item.registryKey === activeKey)
}

/* ============================================================
   LAYOUT (wrapper — só monta o Provider)
   ============================================================ */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TabsProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </TabsProvider>
  )
}

/* ============================================================
   LAYOUT INNER — usa o contexto de abas
   ============================================================ */
function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { activeKey, openTab } = useTabs()

  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const item of NAV_ITEMS) {
      if (item.type === "group") {
        initial[item.label] = isGroupActive(item, activeKey)
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

  function handleOpenTab(item: { label: string; registryKey: string; params?: Record<string, any> }) {
    openTab({
      key: item.registryKey,
      registryKey: item.registryKey,
      label: item.label,
      params: item.params,
      closable: item.registryKey !== "dashboard",
    })
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
                const active = activeKey === item.registryKey
                return (
                  <button
                    key={item.registryKey}
                    onClick={() => handleOpenTab(item)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded transition-colors text-left ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <item.icon size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                )
              }

              // GRUPO
              const groupActive = isGroupActive(item, activeKey)
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
                        // sub-item ativo: aba ativa é essa registryKey E (se houver initialTab) ela bate com o params atual
                        const active =
                          activeKey === sub.registryKey &&
                          (!sub.params?.initialTab || true) // destaque fica no nível da aba; refine se quiser destacar a sub-aba exata

                        return (
                          <button
                            key={`${sub.registryKey}-${sub.label}`}
                            onClick={() => handleOpenTab(sub)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-left ${
                              active
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            }`}
                          >
                            <sub.icon size={14} className="shrink-0" />
                            <span className="truncate">{sub.label}</span>
                          </button>
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

      {/* CONTENT — não usa mais {children} do Next, o conteúdo vem das abas */}
      <main className="flex-1 bg-zinc-100 overflow-y-auto">
        <TabsHost />
      </main>
    </div>
  )
}