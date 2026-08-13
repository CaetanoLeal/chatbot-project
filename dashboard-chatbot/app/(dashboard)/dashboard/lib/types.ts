// lib/types.ts
export type Period = "today" | "week" | "year" | "custom"

export interface KpiValue {
  total: number
  variacao?: number
}

export interface DashboardKpis {
  atendimentos: KpiValue
  mensagensRecebidas: KpiValue
  mensagensEnviadas: KpiValue
  taxaFinalizacao: { total: number }
  novosCadastros: KpiValue
  taxaConversaoCadastro: { total: number; variacao: number }
  tempoMedioAtendimento: { minutos: number }
  instancias: { ativas: number; total: number }
  funis: { total: number }
}

export interface TimelinePoint {
  data: string
  total?: number
  recebidas?: number
  enviadas?: number
}

export interface StatusDistribuicaoItem {
  codigo: string
  status: string
  total: number
}

export interface CanalDistribuicaoItem {
  provider: string
  total: number
}

export interface SetorDistribuicaoItem {
  setor: string
  total: number
}

export interface PicoHorarioItem {
  hora: number
  total: number
}

export interface DashboardCharts {
  mensagensTimeline: TimelinePoint[]
  atendimentosTimeline: TimelinePoint[]
  statusDistribuicao: StatusDistribuicaoItem[]
  canalDistribuicao: CanalDistribuicaoItem[]
  setorDistribuicao: SetorDistribuicaoItem[]
  picoHorario: PicoHorarioItem[]
}

export interface TopFunilItem {
  nome: string
  totalUtilizadores: number
  totalConcluidos: number
  taxaConclusao: number
}

export interface TopInstanciaItem {
  nome: string
  totalMensagens: number
}

export interface DashboardRankings {
  topFunis: TopFunilItem[]
  topInstancias: TopInstanciaItem[]
}

export interface FunilCadastroEtapa {
  etapa: string
  total: number
}

export interface DashboardData {
  period: Period
  kpis: DashboardKpis
  charts: DashboardCharts
  rankings: DashboardRankings
  funilCadastro: FunilCadastroEtapa[]
}

// Linguagem visual unificada de status de atendimento — usada no donut,
// nas legendas e nos badges das listas de ranking.
export const STATUS_COLORS: Record<string, string> = {
  B: "#0ea5e9", // CHATBOT   - sky
  C: "#f59e0b", // CADASTRO  - amber
  A: "#8b5cf6", // ATENDENTE - violet
  I: "#0d9488", // IA        - teal
  W: "#a1a1aa", // PENDENTE  - zinc
  F: "#10b981", // FINALIZADO- emerald
}