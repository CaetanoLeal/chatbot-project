//app/(dashboard)/dashboard/funnels/components/CustomNode.tsx
import { Handle, Position } from "reactflow";
import AutoHandles from "./AutoHandles";
import type { FlowNodeData } from "../lib/transform";

// Styles
const baseNodeStyle = "bg-white border shadow-sm rounded-lg p-4 w-72 text-zinc-800 transition-shadow";
const headerStyle = "font-semibold text-xs text-zinc-400 mb-2 tracking-wide uppercase";
const handleStyle = "w-2 h-2 rounded-full border-zinc-300";

// Função para definir o estilo do nó com base na seleção
function nodeStyle(selected?: boolean) {
  return `${baseNodeStyle} ${selected ? "border-blue-400 ring-2 ring-blue-100" : "border-zinc-200"}`;
}

// Componente para exibir um badge indicando que o nó está vinculado a um setor
function SetorBadge({ idSetor }: { idSetor?: string | null }) {
  if (!idSetor) return null;
  return (
    <span className="bg-amber-50 text-amber-700 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-100">
      setor vinculado
    </span>
  );
}

// Tipos de propriedades para os componentes de nó
type NodeProps = { data: FlowNodeData; selected?: boolean };

{/* Componente para exibir um nó de texto seco */}
export const TextNode = ({ data, selected }: NodeProps) => (
  <div className={nodeStyle(selected)}>
    <AutoHandles />
    <div className="flex justify-between items-center mb-2">
      <div className={headerStyle}>{data.label || (data.cdMensagem === 0 ? "Início" : "Mensagem de Texto")}</div>
      {data.isFinalizar && (
        <span className="bg-zinc-100 text-zinc-500 text-[10px] font-mono px-2 py-0.5 rounded">fim de fluxo</span>
      )}
    </div>
    <div className="text-sm text-zinc-700 bg-zinc-50 p-2 rounded border border-zinc-100">{data.text}</div>
  </div>
);

{/* Componente para exibir um nó de pergunta */}
export const QuestionNode = ({ data, selected }: NodeProps) => (
  <div className={nodeStyle(selected)}>
    <AutoHandles />
    <div className="flex justify-between items-center mb-2">
      <div className={headerStyle}>Aguardar Resposta</div>
      {data.idCampo && (
        <span className="bg-blue-50 text-blue-600 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-100">
          salva em campo
        </span>
      )}
    </div>
    <div className="text-sm text-zinc-700 bg-zinc-50 p-2 rounded border border-zinc-100">{data.text}</div>
  </div>
);

{/* Componente para exibir um nó de escolhas */}
export const ButtonsNode = ({ data, selected }: NodeProps) => (
  <div className={nodeStyle(selected)}>
    <Handle type="target" position={Position.Left} className={`${handleStyle} bg-zinc-100`} />
    <Handle type="target" position={Position.Top} className={`${handleStyle} bg-zinc-100`} />
    <div className={headerStyle}>Menu de Opções</div>
    <div className="text-sm text-zinc-700 bg-zinc-50 p-2 rounded border border-zinc-100 mb-3">{data.text}</div>
    <div className="flex flex-col gap-2">
      {(data.buttons ?? []).map((btn) => (
        <div key={btn.id} className="relative bg-white border border-zinc-200 rounded p-2 text-sm text-center text-zinc-600 hover:bg-zinc-50">
          {btn.label}

          {/* Handles específicos para este botão: Direita, Esquerda e Baixo (NUNCA TOPO) */}
          <Handle type="source" position={Position.Right} id={`${btn.id}-right`} style={{ top: '50%', right: '-4px' }} className={`${handleStyle} bg-blue-500`} />
          <Handle type="source" position={Position.Left} id={`${btn.id}-left`} style={{ top: '50%', left: '-4px' }} className={`${handleStyle} bg-blue-500`} />
          <Handle type="source" position={Position.Bottom} id={`${btn.id}-bottom`} style={{ bottom: '-4px', left: '50%' }} className={`${handleStyle} bg-blue-500`} />
        </div>
      ))}
    </div>
  </div>
);

// Componente para exibir um nó de ação (transferência, espera, fim de atendimento)

const STATUS_LABEL: Record<string, string> = {
  H: "Transferir: Atendente",
  I: "Transferir: Inteligência Artificial",
  P: "Aguardar Atendente (Fila)",
  A: "Fim de Atendimento",
};

// Mapeamento de status para classes de borda
const STATUS_BORDER: Record<string, string> = {
  H: "border-l-emerald-500",
  I: "border-l-purple-500",
  P: "border-l-amber-500",
  A: "border-l-zinc-400",
};

{/* Componente para exibir um nó de ação */}
export const ActionNode = ({ data, selected }: NodeProps) => {
  const status = data.sgChatStatus ?? "A";
  return (
    <div className={`${nodeStyle(selected)} border-l-4 ${STATUS_BORDER[status] ?? "border-l-zinc-400"}`}>
      <AutoHandles />
      <div className="flex justify-between items-center mb-2">
        <div className={headerStyle}>{STATUS_LABEL[status] ?? "Finalizar"}</div>
        <SetorBadge idSetor={data.idSetor} />
      </div>
      <div className="text-sm font-medium text-zinc-700">{data.text}</div>
    </div>
  );
};