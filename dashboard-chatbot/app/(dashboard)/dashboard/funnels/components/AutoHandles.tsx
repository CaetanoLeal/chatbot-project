//app/(dashboard)/dashboard/funnels/components/AutoHandles.tsx
import { Handle, Position } from "reactflow";
import { Node, Edge } from "reactflow";

// Função para ajustar automaticamente as posições das linhas (edges) entre os nós (nodes)
// edges são as linhas conectando os nós, e nodes são os próprios nós do fluxo.
export const getAutoRoutedEdges = (nodes: Node[], edges: Edge[]) => {
  return edges.map((edge) => {
    // --- NOVA REGRA: Se a linha foi conectada manualmente pelo usuário, não altera a rota! ---
    if (edge.data?.isManual) return edge;

    // liga os nós de origem e destino da linha
    const sourceNode = nodes.find((n) => n.id === edge.source);
    // liga o nó de destino da linha
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return edge;

    // verifica se o lado de destino da linha já está ocupado por outra linha
    const incomingEdges = edges.filter((e) => e.target === sourceNode.id);
    // obtém os lados ocupados do nó de destino
    const occupiedTargetSides = incomingEdges.map((e) => e.targetHandle).filter(Boolean);

    // obtém as dimensões dos nós de origem e destino, considerando medidas personalizadas se disponíveis
    // @ts-ignore
    const sWidth = sourceNode.measured?.width ?? sourceNode.width ?? 288;
    // @ts-ignore
    const sHeight = sourceNode.measured?.height ?? sourceNode.height ?? 100;
    // @ts-ignore
    const tWidth = targetNode.measured?.width ?? targetNode.width ?? 288;
    // @ts-ignore
    const tHeight = targetNode.measured?.height ?? targetNode.height ?? 100;

    // calcula os centros dos nós de origem e destino
    const sourceCenter = {
      x: sourceNode.position.x + sWidth / 2,
      y: sourceNode.position.y + sHeight / 2,
    };
    
    // calcula o centro do nó de destino
    const targetCenter = {
      x: targetNode.position.x + tWidth / 2,
      y: targetNode.position.y + tHeight / 2,
    };
    // dx = diferença horizontal entre os centros dos nós de origem e destino
    // dy = diferença vertical entre os centros dos nós de origem e destino
    // determina a direção da linha com base nas diferenças dx e dy
    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    let sourceDirection = "";
    let targetDirection = "";

    // determina a direção da linha com base nas diferenças dx e dy, o calculo funciona da seguinte forma: se a diferença horizontal (dx) for maior que a diferença vertical (dy), a linha será horizontal, caso contrário, será vertical.
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        sourceDirection = "right";
        targetDirection = "left";
      } else {
        sourceDirection = "left";
        targetDirection = "right";
      }
    } else {
      if (dy > 0) {
        sourceDirection = "bottom";
        targetDirection = "top";
      } else {
        sourceDirection = "top";
        targetDirection = "bottom";
      }
    }

    // Se o lado de destino da linha já estiver ocupado, ajusta a direção da linha para evitar sobreposição
    if (occupiedTargetSides.includes(sourceDirection)) {
      if (sourceDirection === "top" || sourceDirection === "bottom") {
        sourceDirection = dx > 0 ? "right" : "left";
        targetDirection = dx > 0 ? "left" : "right";
      } else {
        sourceDirection = dy > 0 ? "bottom" : "top";
        targetDirection = dy > 0 ? "top" : "bottom";
      }
    }

    let newSourceHandle = "";
    let newTargetHandle = targetDirection;

    // Se a linha não tiver um lado de origem definido, ou se o lado de origem for um dos lados padrão (começando com "out-"), define o lado de origem como "out-" + direção da origem. Caso contrário, mantém o lado de origem atual.
    const isStandardSource = !edge.sourceHandle || edge.sourceHandle.startsWith("out-");

    // Se a linha não tiver um lado de destino definido, define o lado de destino como a direção da linha calculada anteriormente.
    if (isStandardSource) {
      newSourceHandle = `out-${sourceDirection}`;
    } else {
      // Se a linha tiver um lado de origem definido, mas não for um dos lados padrão, mantém o lado de origem atual.
      // @ts-ignore
      const baseId = edge.sourceHandle.replace(/-(left|right|bottom|top)$/, "");

      // Se a linha estiver conectada ao topo do nó de destino, ou se o lado de destino já estiver ocupado, ajusta a direção da linha para evitar sobreposição
      if (sourceDirection === "top" || occupiedTargetSides.includes(sourceDirection)) {
        sourceDirection = dx > 0 ? "right" : "left";
        targetDirection = dx > 0 ? "left" : "right"; 
        newTargetHandle = targetDirection;
      }

      newSourceHandle = `${baseId}-${sourceDirection}`;
    }

    // Se o lado de origem ou destino da linha mudou, atualiza a linha com os novos lados
    if (edge.sourceHandle !== newSourceHandle || edge.targetHandle !== newTargetHandle) {
      return {
        ...edge,
        sourceHandle: newSourceHandle,
        targetHandle: newTargetHandle,
      };
    }

    return edge;
  });
};

// Estilos para os nós e cabeçalhos
const handleStyle =
  "w-2 h-2 rounded-full border border-zinc-300 transition-all cursor-crosshair hover:scale-150";

export default function AutoHandles() {
  return (
    <>
      {/* TARGETS */}
      <Handle id="left" type="target" position={Position.Left} className={`${handleStyle} bg-zinc-100`} />
      <Handle id="top" type="target" position={Position.Top} className={`${handleStyle} bg-zinc-100`} />
      <Handle id="right" type="target" position={Position.Right} className={`${handleStyle} bg-zinc-100`} />
      <Handle id="bottom" type="target" position={Position.Bottom} className={`${handleStyle} bg-zinc-100`} />

      {/* SOURCES */}
      <Handle id="out-left" type="source" position={Position.Left} className={`${handleStyle} bg-blue-500`} />
      <Handle id="out-top" type="source" position={Position.Top} className={`${handleStyle} bg-blue-500`} />
      <Handle id="out-right" type="source" position={Position.Right} className={`${handleStyle} bg-blue-500`} />
      <Handle id="out-bottom" type="source" position={Position.Bottom} className={`${handleStyle} bg-blue-500`} />
    </>
  );
}