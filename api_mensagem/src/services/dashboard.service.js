const dashboardRepository = require("../repositories/dashboard.repository")

const VALID_PERIODS = ["today", "month", "year"]

/**
 * Calcula o intervalo do período selecionado e o intervalo imediatamente
 * anterior (mesma duração), usado para calcular variação percentual.
 */
function getPeriodRange(period) {
  const now = new Date()
  let start

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case "year":
      start = new Date(now.getFullYear(), 0, 1)
      break
    case "month":
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
  }

  const end = now
  const durationMs = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime())
  const prevStart = new Date(start.getTime() - durationMs)

  return { start, end, prevStart, prevEnd }
}

function getTruncUnit(period) {
  if (period === "today") return "hour"
  if (period === "year") return "month"
  return "day"
}

function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function ratio(part, total) {
  if (!total) return 0
  return Number(((part / total) * 100).toFixed(1))
}

async function getKpis(period) {
  const { start, end, prevStart, prevEnd } = getPeriodRange(period)

  const [
    chats,
    chatsPrev,
    recebidas,
    recebidasPrev,
    enviadas,
    enviadasPrev,
    finalizados,
    cadastrosIniciados,
    cadastrosConcluidos,
    cadastrosIniciadosPrev,
    cadastrosConcluidosPrev,
    tempoMedio,
    instanciasAtivas,
    instanciasTotal,
    funis,
  ] = await Promise.all([
    dashboardRepository.countChats(start, end),
    dashboardRepository.countChats(prevStart, prevEnd),
    dashboardRepository.countMessages(start, end, false),
    dashboardRepository.countMessages(prevStart, prevEnd, false),
    dashboardRepository.countMessages(start, end, true),
    dashboardRepository.countMessages(prevStart, prevEnd, true),
    dashboardRepository.countFinishedChats(start, end),
    dashboardRepository.countRegistrationsStarted(start, end),
    dashboardRepository.countRegistrationsCompleted(start, end),
    dashboardRepository.countRegistrationsStarted(prevStart, prevEnd),
    dashboardRepository.countRegistrationsCompleted(prevStart, prevEnd),
    dashboardRepository.avgAttendanceMinutes(start, end),
    dashboardRepository.countActiveInstances(),
    dashboardRepository.countInstances(),
    dashboardRepository.countFunnels(),
  ])

  return {
    atendimentos: { total: chats, variacao: percentChange(chats, chatsPrev) },
    mensagensRecebidas: { total: recebidas, variacao: percentChange(recebidas, recebidasPrev) },
    mensagensEnviadas: { total: enviadas, variacao: percentChange(enviadas, enviadasPrev) },
    taxaFinalizacao: { total: ratio(finalizados, chats) },
    novosCadastros: {
      total: cadastrosConcluidos,
      variacao: percentChange(cadastrosConcluidos, cadastrosConcluidosPrev),
    },
    taxaConversaoCadastro: {
      total: ratio(cadastrosConcluidos, cadastrosIniciados),
      variacao: percentChange(
        ratio(cadastrosConcluidos, cadastrosIniciados),
        ratio(cadastrosConcluidosPrev, cadastrosIniciadosPrev)
      ),
    },
    tempoMedioAtendimento: { minutos: tempoMedio },
    instancias: { ativas: instanciasAtivas, total: instanciasTotal },
    funis: { total: funis },
  }
}

async function getCharts(period) {
  const { start, end } = getPeriodRange(period)
  const truncUnit = getTruncUnit(period)

  const [
    mensagensTimeline,
    atendimentosTimeline,
    statusDistribuicao,
    canalDistribuicao,
    setorDistribuicao,
    picoHorario,
  ] = await Promise.all([
    dashboardRepository.messagesTimeline(start, end, truncUnit),
    dashboardRepository.chatsTimeline(start, end, truncUnit),
    dashboardRepository.chatsByStatus(start, end),
    dashboardRepository.messagesByProvider(start, end),
    dashboardRepository.chatsBySetor(start, end),
    dashboardRepository.messagesByHour(start, end),
  ])

  return {
    mensagensTimeline: mensagensTimeline.map((r) => ({
      data: r.bucket,
      recebidas: r.recebidas,
      enviadas: r.enviadas,
    })),
    atendimentosTimeline: atendimentosTimeline.map((r) => ({
      data: r.bucket,
      total: r.total,
    })),
    statusDistribuicao,
    canalDistribuicao,
    setorDistribuicao,
    picoHorario,
  }
}

async function getRankings(period) {
  const { start, end } = getPeriodRange(period)

  const [funis, instancias] = await Promise.all([
    dashboardRepository.topFunnels(start, end, 5),
    dashboardRepository.topInstances(start, end, 5),
  ])

  return {
    topFunis: funis.map((f) => ({
      nome: f.funil,
      totalUtilizadores: f.total_utilizadores,
      totalConcluidos: f.total_concluidos,
      taxaConclusao: ratio(f.total_concluidos, f.total_utilizadores),
    })),
    topInstancias: instancias.map((i) => ({
      nome: i.instancia,
      totalMensagens: i.total,
    })),
  }
}

async function getRegistrationFunnel() {
  const id_funil = await dashboardRepository.getMainFunnelId()
  if (!id_funil) return []

  const steps = await dashboardRepository.registrationFunnelSteps(id_funil)
  return steps.map((s) => ({ etapa: s.descricao, total: s.total }))
}

async function getDashboardData(periodInput) {
  const period = VALID_PERIODS.includes(periodInput) ? periodInput : "month"

  const [kpis, charts, rankings, funilCadastro] = await Promise.all([
    getKpis(period),
    getCharts(period),
    getRankings(period),
    getRegistrationFunnel(),
  ])

  return { period, kpis, charts, rankings, funilCadastro }
}

module.exports = { getDashboardData, getPeriodRange, getTruncUnit, percentChange, ratio }