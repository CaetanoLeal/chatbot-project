// app/(dashboard)/dashboard/cadastro/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon, X } from "lucide-react";

import KeepAliveTabs from "../components/keepAliveTabs";

// Reaproveitando as páginas que você já tem — sem duplicar código
import AtendentesPage from "../attendants/page";
import ContactsPage from "../contacts/page";
import SetoresPage from "../sector/page";
import FunisPage from "../funnels/page";
import IaPage from "../aipannel/aifunnels/page";
import ShortcutsPage from "../shortcuts/page";

const TAB_KEYS = ["atendente", "contato", "funil", "ia", "atalho", "setor"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TAB_LABELS: Record<TabKey, string> = {
  atendente: "Atendente",
  contato: "Contato",
  funil: "Funil",
  ia: "IA",
  atalho: "Msg Predefinida",
  setor: "Setor",
};

export default function CadastroPage({ initialTab }: { initialTab?: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(
    initialTab && TAB_KEYS.includes(initialTab) ? initialTab : "atendente"
  )

  useEffect(() => {
    if (initialTab && TAB_KEYS.includes(initialTab)) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  function handleChangeTab(key: string) {
    setActiveTab(key as TabKey)
  }

  const tabs = [
    { key: "atendente", label: TAB_LABELS.atendente, content: <AtendentesPage /> },
    { key: "contato", label: TAB_LABELS.contato, content: <ContactsPage /> },
    { key: "funil", label: TAB_LABELS.funil, content: <FunisPage /> },
    { key: "ia", label: TAB_LABELS.ia, content: <IaPage /> },
    { key: "atalho", label: TAB_LABELS.atalho, content: <ShortcutsPage /> },
    { key: "setor", label: TAB_LABELS.setor, content: <SetoresPage /> },
  ]

  return (
    <div className="h-full flex flex-col">
      <KeepAliveTabs tabs={tabs} activeKey={activeTab} onChange={handleChangeTab} />
    </div>
  )
}