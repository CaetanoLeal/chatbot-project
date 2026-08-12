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

export default function CadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab") as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabFromUrl && TAB_KEYS.includes(tabFromUrl) ? tabFromUrl : "atendente"
  );

  // Mantém o estado sincronizado se o usuário clicar em um link do menu lateral
  // que já aponta pra /dashboard/cadastro?tab=xxx
  useEffect(() => {
    if (tabFromUrl && TAB_KEYS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChangeTab(key: string) {
    setActiveTab(key as TabKey);
    // scroll:false + replace evita reload da página, só atualiza a URL (deep-link / botão voltar)
    router.replace(`/dashboard/cadastro?tab=${key}`, { scroll: false });
  }

  const tabs = [
    { key: "atendente", label: TAB_LABELS.atendente, content: <AtendentesPage /> },
    { key: "contato", label: TAB_LABELS.contato, content: <ContactsPage /> },
    { key: "funil", label: TAB_LABELS.funil, content: <FunisPage /> },
    { key: "ia", label: TAB_LABELS.ia, content: <IaPage /> },
    { key: "atalho", label: TAB_LABELS.atalho, content: <ShortcutsPage /> },
    { key: "setor", label: TAB_LABELS.setor, content: <SetoresPage /> },
  ];

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col">
      <KeepAliveTabs tabs={tabs} activeKey={activeTab} onChange={handleChangeTab} />
    </div>
  );
}