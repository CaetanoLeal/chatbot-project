// app/(dashboard)/dashboard/registry/tab-registry.tsx
"use client"

import { ComponentType } from "react"

import DashboardPage from "../page"
import PainelIAPage from "../aipannel/page"
import MessagesPage from "../messages/page"
import HistoryPage from "../history/page"
import InstancesPage from "../instances/page"

// Telas que antes viviam "dentro" da aba Cadastro — agora cada uma é uma aba própria
import AtendentesPage from "../attendants/page"
import ContactsPage from "../contacts/page"
import FunisPage from "../funnels/page"
import IaPage from "../aipannel/aifunnels/page"
import ShortcutsPage from "../shortcuts/page"
import SetoresPage from "../sector/page"

export const TAB_REGISTRY: Record<string, { label: string; component: ComponentType<any> }> = {
  dashboard:    { label: "Dashboard",       component: DashboardPage },
  aipannel:     { label: "Painel IA",       component: PainelIAPage },

  // cada subitem do grupo "Cadastro" agora é uma entrada própria no registry
  atendente:    { label: "Atendente",       component: AtendentesPage },
  contato:      { label: "Contato",         component: ContactsPage },
  funil:        { label: "Funil",           component: FunisPage },
  ia:           { label: "IA",              component: IaPage },
  atalho:       { label: "Msg Predefinida", component: ShortcutsPage },
  setor:        { label: "Setor",           component: SetoresPage },

  atendimento:  { label: "Atendimento",     component: MessagesPage },
  historico:    { label: "Histórico",       component: HistoryPage },
  instancias:   { label: "Instância",       component: InstancesPage },
}