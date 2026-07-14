// app/(dashboard)/dashboard/funnels/lib/transform.ts
import { Edge, MarkerType, Node } from 'reactflow'
import type { Funil, Mensagem } from './api'

export type FlowNodeData = {
  label?: string
  text: string
  variavel?: string
  idCampo?: string | null
  idSetor?: string | null
  isFinalizar?: boolean
  sgChatStatus?: 'A' | 'H' | 'I' | 'P' | null
  buttons?: { id: string; label: string }[]
  fluxo: 'cadastro' | 'chatbot'
  cdMensagem: number
}

const edgeOptions = {
  animated: true,
  style: { stroke: '#94a3b8', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
}

const transitionEdgeStyle = {
  animated: false,
  style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' },
}

const LEVEL_GAP_X = 380
const NODE_GAP_Y = 230
const BASE_Y = 40

/** Determina qual componente visual (nodeType) usar para uma mensagem,
 *  a partir das mesmas regras que o motor usa em
 *  verificarComportamentoMensagem() (src/helpers/funil.helper.js). */
function resolveNodeType(msg: Mensagem): 'textNode' | 'questionNode' | 'buttonsNode' | 'actionNode' {
  // Mesma ordem de prioridade de verificarComportamentoMensagem() no motor:
  // is_finalizar sempre vence, mesmo que a mensagem também tenha botões
  // ou is_aguardar marcado.
  if (msg.is_finalizar) {
    // mensagens de chatbot sempre trazem a chave sg_chat_status (mesmo que
    // null/'A'); mensagens de cadastro nunca trazem essa chave — é assim
    // que diferenciamos "fim de atendimento" (actionNode) de "fim de
    // cadastro, seguir para o chatbot" (textNode simples).
    if (msg.sg_chat_status !== undefined) return 'actionNode'
    return 'textNode'
  }

  if (msg.botoes && msg.botoes.length > 0) return 'buttonsNode'
  if (msg.is_aguardar) return 'questionNode'

  return 'textNode'
}

/** Layout automático em camadas (BFS a partir de cd_mensagem = 0),
 *  usado apenas quando a mensagem ainda não tem pos_x/pos_y salvos. */
function autoLayout(mensagens: Mensagem[]): Map<number, { x: number; y: number }> {
  const byCd = new Map(mensagens.map(m => [m.cd_mensagem, m]))
  const level = new Map<number, number>()
  const visited = new Set<number>()

  const queue: number[] = mensagens.some(m => m.cd_mensagem === 0) ? [0] : []
  level.set(0, 0)

  while (queue.length > 0) {
    const cd = queue.shift()!
    if (visited.has(cd)) continue
    visited.add(cd)

    const msg = byCd.get(cd)
    if (!msg) continue

    const destinos: number[] = []
    if (msg.botoes.length > 0) {
      for (const b of msg.botoes) if (b.cd_mensagem_destino != null) destinos.push(b.cd_mensagem_destino)
    } else if (msg.cd_mensagem_destino != null) {
      destinos.push(msg.cd_mensagem_destino)
    }

    for (const destino of destinos) {
      const nivelAtual = level.get(cd) ?? 0
      const nivelDestino = level.get(destino)
      if (nivelDestino === undefined || nivelDestino < nivelAtual + 1) {
        // evita voltar nível em loops simples (ex: validação -> pergunta novamente)
        if (!visited.has(destino) || (nivelDestino ?? 0) < nivelAtual + 1) {
          level.set(destino, Math.max(nivelAtual + 1, nivelDestino ?? 0))
        }
      }
      if (!visited.has(destino)) queue.push(destino)
    }
  }

  // órfãos (não alcançados a partir do 0) entram no fim, um por nível próprio
  let maxLevel = Math.max(0, ...Array.from(level.values()))
  for (const m of mensagens) {
    if (!level.has(m.cd_mensagem)) {
      maxLevel += 1
      level.set(m.cd_mensagem, maxLevel)
    }
  }

  const porNivel = new Map<number, number[]>()
  for (const m of mensagens) {
    const lvl = level.get(m.cd_mensagem) ?? 0
    if (!porNivel.has(lvl)) porNivel.set(lvl, [])
    porNivel.get(lvl)!.push(m.cd_mensagem)
  }

  const positions = new Map<number, { x: number; y: number }>()
  for (const [lvl, cds] of porNivel) {
    cds.sort((a, b) => a - b)
    cds.forEach((cd, idx) => {
      positions.set(cd, { x: lvl * LEVEL_GAP_X, y: BASE_Y + idx * NODE_GAP_Y })
    })
  }

  return positions
}

function mensagensToNodes(
  mensagens: Mensagem[],
  fluxo: 'cadastro' | 'chatbot',
  prefixo: string
): Node<FlowNodeData>[] {
  const layout = autoLayout(mensagens)

  return mensagens.map(msg => {
    const pos =
      msg.pos_x != null && msg.pos_y != null
        ? { x: Number(msg.pos_x), y: Number(msg.pos_y) }
        : layout.get(msg.cd_mensagem) ?? { x: 0, y: 0 }

    const type = resolveNodeType(msg)

    const data: FlowNodeData = {
      text: msg.ds_mensagem,
      label: msg.cd_mensagem === 0 ? 'Início' : undefined,
      idCampo: msg.id_campo,
      idSetor: msg.id_setor,
      isFinalizar: msg.is_finalizar,
      sgChatStatus: msg.sg_chat_status ?? null,
      fluxo,
      cdMensagem: msg.cd_mensagem,
      buttons: msg.botoes.map(b => ({ id: `btn-${b.cd_botao}`, label: b.ds_botao })),
    }

    return {
      id: `${prefixo}-${msg.cd_mensagem}`,
      type,
      position: pos,
      data,
    }
  })
}

function mensagensToEdges(mensagens: Mensagem[], prefixo: string): Edge[] {
  const edges: Edge[] = []

  for (const msg of mensagens) {
    const sourceId = `${prefixo}-${msg.cd_mensagem}`

    if (msg.botoes.length > 0) {
      for (const b of msg.botoes) {
        if (b.cd_mensagem_destino == null) continue
        edges.push({
          id: `${sourceId}-btn-${b.cd_botao}`,
          source: sourceId,
          sourceHandle: `btn-${b.cd_botao}-right`,
          target: `${prefixo}-${b.cd_mensagem_destino}`,
          ...edgeOptions,
        })
      }
      continue
    }

    if (msg.cd_mensagem_destino != null) {
      edges.push({
        id: `${sourceId}-dest`,
        source: sourceId,
        target: `${prefixo}-${msg.cd_mensagem_destino}`,
        ...edgeOptions,
      })
    }
  }

  return edges
}

/** Converte a estrutura vinda da API (cadastro[] + chatbot[]) em
 *  nodes/edges do React Flow, prontos para o builder. */
export function funilParaFluxo(funil: Funil): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const cadastroNodes = mensagensToNodes(funil.cadastro, 'cadastro', 'cad')
  const chatbotNodes = mensagensToNodes(funil.chatbot, 'chatbot', 'bot')

  // desloca o chatbot para a direita do cadastro para não sobrepor,
  // caso ambos tenham usado auto-layout (sem pos_x/pos_y salvos)
  const usouAutoLayoutCadastro = funil.cadastro.some(m => m.pos_x == null)
  if (usouAutoLayoutCadastro && cadastroNodes.length > 0) {
    const maxX = Math.max(...cadastroNodes.map(n => n.position.x))
    const offsetX = maxX + LEVEL_GAP_X * 1.3
    const usouAutoLayoutChatbot = funil.chatbot.some(m => m.pos_x == null)
    if (usouAutoLayoutChatbot) {
      for (const n of chatbotNodes) n.position.x += offsetX
    }
  }

  const cadastroEdges = mensagensToEdges(funil.cadastro, 'cad')
  const chatbotEdges = mensagensToEdges(funil.chatbot, 'bot')

  // transição visual cadastro -> chatbot: liga a(s) mensagem(ns) de
  // cadastro com is_finalizar (que chamam _migrarParaChatbot) ao node
  // inicial (cd_mensagem = 0) do chatbot.
  const transicaoEdges: Edge[] = funil.cadastro
    .filter(m => m.is_finalizar)
    .map(m => ({
      id: `transicao-${m.cd_mensagem}`,
      source: `cad-${m.cd_mensagem}`,
      target: 'bot-0',
      ...transitionEdgeStyle,
    }))
    .filter(e => funil.chatbot.some(m => m.cd_mensagem === 0))

  return {
    nodes: [...cadastroNodes, ...chatbotNodes],
    edges: [...cadastroEdges, ...chatbotEdges, ...transicaoEdges],
  }
}

/** Caminho inverso: nodes/edges do editor -> payload para
 *  PUT /api/funis/:id/estrutura. Usa as edges para reconstruir
 *  cd_mensagem_destino (mensagens simples) ou o destino de cada botão
 *  (buttonsNode), e a posição atual do node para persistir o layout. */
export function fluxoParaFunil(nodes: Node<FlowNodeData>[], edges: Edge[]): {
  cadastro: Mensagem[]
  chatbot: Mensagem[]
} {
  const cadastro: Mensagem[] = []
  const chatbot: Mensagem[] = []

  for (const node of nodes) {
    const data = node.data
    const outgoing = edges.filter(e => e.source === node.id)

    let cd_mensagem_destino: number | null = null
    const botoes: Mensagem['botoes'] = []

    if (data.buttons && data.buttons.length > 0) {
      data.buttons.forEach((btn, idx) => {
        const edge = outgoing.find(e => e.sourceHandle?.startsWith(`${btn.id}-`))
        const destinoCd = edge ? Number(edge.target.split('-').pop()) : null
        botoes.push({
          cd_botao: idx + 1,
          ds_botao: btn.label,
          cd_mensagem_destino: Number.isFinite(destinoCd) ? destinoCd : null,
        })
      })
    } else {
      // ignora edges de transição cadastro -> chatbot (não viram cd_mensagem_destino)
      const edge = outgoing.find(e => !e.id.startsWith('transicao-'))
      if (edge) {
        const destinoCd = Number(edge.target.split('-').pop())
        cd_mensagem_destino = Number.isFinite(destinoCd) ? destinoCd : null
      }
    }

    const mensagem: Mensagem = {
      cd_mensagem: data.cdMensagem,
      ds_mensagem: data.text,
      cd_mensagem_destino,
      is_aguardar: node.type === 'questionNode',
      is_finalizar: !!data.isFinalizar || node.type === 'actionNode',
      id_setor: data.idSetor ?? null,
      id_campo: data.idCampo ?? null,
      sg_chat_status: data.fluxo === 'chatbot' ? data.sgChatStatus ?? null : undefined,
      pos_x: node.position.x,
      pos_y: node.position.y,
      botoes,
    }

    if (data.fluxo === 'cadastro') cadastro.push(mensagem)
    else chatbot.push(mensagem)
  }

  return { cadastro, chatbot }
}