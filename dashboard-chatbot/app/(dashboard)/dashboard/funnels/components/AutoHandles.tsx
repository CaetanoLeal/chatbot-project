//app/(dashboard)/dashboard/funnels/components/AutoHandles.tsx
import { Handle, Position } from "reactflow";
import { Node, Edge } from "reactflow";

export const getAutoRoutedEdges = (nodes: Node[], edges: Edge[]) => {
  return edges.map((edge) => {
    // --- NOVA REGRA: Se a linha foi conectada manualmente pelo usuário, não altera a rota! ---
    if (edge.data?.isManual) return edge;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return edge;

    const incomingEdges = edges.filter((e) => e.target === sourceNode.id);
    const occupiedTargetSides = incomingEdges.map((e) => e.targetHandle).filter(Boolean);

    // @ts-ignore
    const sWidth = sourceNode.measured?.width ?? sourceNode.width ?? 288;
    // @ts-ignore
    const sHeight = sourceNode.measured?.height ?? sourceNode.height ?? 100;
    // @ts-ignore
    const tWidth = targetNode.measured?.width ?? targetNode.width ?? 288;
    // @ts-ignore
    const tHeight = targetNode.measured?.height ?? targetNode.height ?? 100;

    const sourceCenter = {
      x: sourceNode.position.x + sWidth / 2,
      y: sourceNode.position.y + sHeight / 2,
    };
    
    const targetCenter = {
      x: targetNode.position.x + tWidth / 2,
      y: targetNode.position.y + tHeight / 2,
    };

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    let sourceDirection = "";
    let targetDirection = "";

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

    const isStandardSource = !edge.sourceHandle || edge.sourceHandle.startsWith("out-");

    if (isStandardSource) {
      newSourceHandle = `out-${sourceDirection}`;
    } else {
      // @ts-ignore
      const baseId = edge.sourceHandle.replace(/-(left|right|bottom|top)$/, "");

      if (sourceDirection === "top" || occupiedTargetSides.includes(sourceDirection)) {
        sourceDirection = dx > 0 ? "right" : "left";
        targetDirection = dx > 0 ? "left" : "right"; 
        newTargetHandle = targetDirection;
      }

      newSourceHandle = `${baseId}-${sourceDirection}`;
    }

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

const handleStyle =
  "w-2 h-2 rounded-full border border-zinc-300 transition-all cursor-crosshair hover:scale-150"; // Adicionei um hover para facilitar clicar no handler

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