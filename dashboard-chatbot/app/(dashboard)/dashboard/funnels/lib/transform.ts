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

/** Determina qual componente visual usar para uma mensagem */
function resolveNodeType(msg: Mensagem): 'textNode' | 'questionNode' | 'buttonsNode' | 'transferNode' | 'endNode' {
  
  // NOVA REGRA DE FINALIZAÇÃO E TRANSFERÊNCIA
  if (msg.is_finalizar) {
    if (msg.id_setor === '11111111-1111-1111-1111-111111111111') {
      return 'endNode' // É uma finalização de fato
    }
    return 'transferNode' // Qualquer outro setor com is_finalizar = true é transferência
  }

  // Restante das regras originais
  if (msg.sg_chat_status && ['H', 'I', 'P'].includes(msg.sg_chat_status)) return 'transferNode'
  if (msg.botoes && msg.botoes.length > 0) return 'buttonsNode'
  if (msg.is_aguardar) return 'questionNode'

  return 'textNode'
}

/** Layout automático em camadas (BFS/DFS) */
function autoLayout(mensagens: Mensagem[]): Map<number, { x: number; y: number }> {
  const byCd = new Map(mensagens.map(m => [m.cd_mensagem, m]));
  const positions = new Map<number, { x: number; y: number }>();
  
  const children = new Map<number, number[]>();
  for (const m of mensagens) {
    const dests = m.botoes?.length > 0 
      ? m.botoes.map(b => b.cd_mensagem_destino).filter(d => d != null)
      : (m.cd_mensagem_destino != null ? [m.cd_mensagem_destino] : []);
    
    for (const dest of dests) {
      if (!children.has(m.cd_mensagem)) children.set(m.cd_mensagem, []);
      children.get(m.cd_mensagem)!.push(dest!);
    }
  }

  function calculate(cd: number, x: number, y: number, visited: Set<number>, yOffsets: Map<number, number>) {
    if (visited.has(cd)) return;
    visited.add(cd);

    positions.set(cd, { x, y });

    const dests = children.get(cd) || [];
    if (dests.length === 0) return;

    const step = NODE_GAP_Y;
    const startY = y - ((dests.length - 1) * step) / 2;

    dests.forEach((dest, index) => {
      calculate(dest, x + LEVEL_GAP_X, startY + (index * step), visited, yOffsets);
    });
  }

  const visited = new Set<number>();
  const yOffsets = new Map<number, number>();
  
  if (byCd.has(0)) {
    calculate(0, 0, BASE_Y, visited, yOffsets);
  }

  mensagens.forEach(m => {
    if (!visited.has(m.cd_mensagem)) {
      calculate(m.cd_mensagem, 0, BASE_Y + (visited.size * NODE_GAP_Y), visited, yOffsets);
    }
  });

  return positions;
}

/** Transforma Mensagens em Nodes verificando se precisam de auto-layout */
function mensagensToNodes(
  mensagens: Mensagem[],
  fluxo: 'cadastro' | 'chatbot',
  prefixo: string
): Node<FlowNodeData>[] {
  const layout = autoLayout(mensagens)

  // INTELIGÊNCIA NOVA: Se TODAS as mensagens estão na posição 0,0 
  // significa que vieram zeradas do banco e precisam do Auto-Layout.
  const precisaAutoLayout = mensagens.length > 0 && mensagens.every(
    (m) => (!m.pos_x || Number(m.pos_x) === 0) && (!m.pos_y || Number(m.pos_y) === 0)
  )

  return mensagens.map(msg => {
    // Se precisar de auto-layout OU os dados do banco forem explicitamente nulos
    const useAutoLayout = precisaAutoLayout || msg.pos_x == null || msg.pos_y == null

    const pos = useAutoLayout
      ? layout.get(msg.cd_mensagem) ?? { x: 0, y: 0 }
      : { x: Number(msg.pos_x), y: Number(msg.pos_y) }

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

/** Transforma Mensagens em Edges */
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

/** Converte a estrutura vinda da API em nodes/edges pro React Flow. */
export function funilParaFluxo(funil: Funil): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const cadastroNodes = mensagensToNodes(funil.cadastro, 'cadastro', 'cad')
  const chatbotNodes = mensagensToNodes(funil.chatbot, 'chatbot', 'bot')

  const cadastroEdges = mensagensToEdges(funil.cadastro, 'cad')
  const chatbotEdges = mensagensToEdges(funil.chatbot, 'bot')

  return {
    nodes: [...cadastroNodes, ...chatbotNodes],
    edges: [...cadastroEdges, ...chatbotEdges],
  }
}

/** Caminho inverso: editor -> payload da API */
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
      const edge = outgoing[0]
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