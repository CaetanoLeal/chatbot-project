// app/(dashboard)/dashboard/context/tabs-context.tsx
"use client"

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react"

export type OpenTab = {
  key: string          // chave única da aba, ex: "dashboard", "historico:chat-123"
  registryKey: string  // chave que aponta pro componente no registry
  label: string
  params?: Record<string, any> // props extras (ex: chatId pra abrir o histórico de um chat específico)
  closable: boolean
}

type TabsContextValue = {
  openTabs: OpenTab[]
  activeKey: string
  openTab: (tab: Omit<OpenTab, "closable"> & { closable?: boolean }) => void
  closeTab: (key: string) => void
  setActiveKey: (key: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

const HOME_TAB: OpenTab = { key: "dashboard", registryKey: "dashboard", label: "Dashboard", closable: false }

export function TabsProvider({ children }: { children: ReactNode }) {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([HOME_TAB])
  const [activeKey, setActiveKeyState] = useState(HOME_TAB.key)

  const openTab = useCallback((tab: Omit<OpenTab, "closable"> & { closable?: boolean }) => {
    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.key === tab.key)
      if (exists) {
        // já aberta: só atualiza os params (ex: trocar o chat exibido no Histórico)
        return prev.map((t) => (t.key === tab.key ? { ...t, params: tab.params ?? t.params } : t))
      }
      return [...prev, { closable: true, ...tab }]
    })
    setActiveKeyState(tab.key)
  }, [])

  const closeTab = useCallback((key: string) => {
    setOpenTabs((prev) => {
      if (prev.length <= 1) return prev
      const closingIndex = prev.findIndex((t) => t.key === key)
      const next = prev.filter((t) => t.key !== key)
      if (key === activeKey) {
        setActiveKeyState(next[Math.max(0, closingIndex - 1)].key)
      }
      return next
    })
  }, [activeKey])

  const value = useMemo(
    () => ({ openTabs, activeKey, openTab, closeTab, setActiveKey: setActiveKeyState }),
    [openTabs, activeKey, openTab, closeTab]
  )

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
}

export function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error("useTabs precisa estar dentro de <TabsProvider>")
  return ctx
}