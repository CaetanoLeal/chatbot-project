import { Handle, Position, Node, Edge } from "reactflow";

type Side = "left" | "right" | "top" | "bottom";

type Point = {
  x: number;
  y: number;
};

function getHandlePositions(node: Node): Record<Side, Point> {
  // @ts-ignore
  const width = node.measured?.width ?? node.width ?? 288;
  // @ts-ignore
  const height = node.measured?.height ?? node.height ?? 100;

  return {
    left: {
      x: node.position.x,
      y: node.position.y + height / 2,
    },
    right: {
      x: node.position.x + width,
      y: node.position.y + height / 2,
    },
    top: {
      x: node.position.x + width / 2,
      y: node.position.y,
    },
    bottom: {
      x: node.position.x + width / 2,
      y: node.position.y + height,
    },
  };
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export const getAutoRoutedEdges = (nodes: Node[], edges: Edge[]) => {
  return edges.map((edge) => {
    if (edge.data?.isManual) return edge;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return edge;

    const incomingEdges = edges.filter(
      (e) => e.target === targetNode.id && e.id !== edge.id
    );

    const occupied = incomingEdges
      .map((e) => e.targetHandle)
      .filter(Boolean);

    const sourceHandles = getHandlePositions(sourceNode);
    const targetHandles = getHandlePositions(targetNode);

    const pairs: {
      source: Side;
      target: Side;
      dist: number;
    }[] = [];

    const sides: Side[] = ["left", "right", "top", "bottom"];

    for (const s of sides) {
      for (const t of sides) {
        pairs.push({
          source: s,
          target: t,
          dist: distance(sourceHandles[s], targetHandles[t]),
        });
      }
    }

    pairs.sort((a, b) => a.dist - b.dist);

    let best = pairs.find((p) => !occupied.includes(p.target));

    if (!best) best = pairs[0];

    let newSourceHandle = "";
    let newTargetHandle = best.target;

    const isStandardSource =
      !edge.sourceHandle || edge.sourceHandle.startsWith("out-");

    if (isStandardSource) {
      newSourceHandle = `out-${best.source}`;
    } else {
      // @ts-ignore
      const baseId = edge.sourceHandle.replace(
        /-(left|right|top|bottom)$/,
        ""
      );

      newSourceHandle = `${baseId}-${best.source}`;
    }

    if (
      edge.sourceHandle !== newSourceHandle ||
      edge.targetHandle !== newTargetHandle
    ) {
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
  "w-2 h-2 rounded-full border border-zinc-300 transition-all cursor-crosshair hover:scale-150";

export default function AutoHandles() {
  return (
    <>
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className={`${handleStyle} bg-zinc-100`}
      />

      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className={`${handleStyle} bg-zinc-100`}
      />

      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className={`${handleStyle} bg-zinc-100`}
      />

      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className={`${handleStyle} bg-zinc-100`}
      />

      <Handle
        id="out-left"
        type="source"
        position={Position.Left}
        className={`${handleStyle} bg-blue-500`}
      />

      <Handle
        id="out-top"
        type="source"
        position={Position.Top}
        className={`${handleStyle} bg-blue-500`}
      />

      <Handle
        id="out-right"
        type="source"
        position={Position.Right}
        className={`${handleStyle} bg-blue-500`}
      />

      <Handle
        id="out-bottom"
        type="source"
        position={Position.Bottom}
        className={`${handleStyle} bg-blue-500`}
      />
    </>
  );
}