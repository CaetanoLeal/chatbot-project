// app/(dashboard)/dashboard/components/TabsHost.tsx
"use client"

import { useTabs } from "../context/tabs-context"
import { TAB_REGISTRY } from "../registry/tab-registry"
import KeepAliveTabs from "./keepAliveTabs"

export default function TabsHost() {
  const { openTabs, activeKey, setActiveKey, closeTab } = useTabs()

  const tabs = openTabs.map((tab) => {
    const entry = TAB_REGISTRY[tab.registryKey]
    const Component = entry?.component
    return {
      key: tab.key,
      label: tab.label,
      closable: tab.closable,
      content: Component ? <Component {...(tab.params ?? {})} /> : null,
    }
  })

  return <KeepAliveTabs tabs={tabs} activeKey={activeKey} onChange={setActiveKey} onClose={closeTab} />
}