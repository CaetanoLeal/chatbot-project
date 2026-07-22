import { Handle, Position } from "reactflow";
import { Lock, MessageSquare, HelpCircle, List, ArrowRightLeft, StopCircle } from "lucide-react";
import AutoHandles from "./AutoHandles";
import type { FlowNodeData } from "../lib/transform";

// Styles base
const baseNodeStyle =
  "bg-white border shadow-sm rounded-lg p-4 w-72 text-zinc-800 transition-all overflow-hidden";
const handleStyle = "w-2 h-2 rounded-full border-zinc-300";

// Função para definir o estilo e borda do nó com base na seleção e se é o inicial
function nodeStyle(
  selected?: boolean,
  isStart?: boolean,
  borderClass = "border-zinc-200"
) {
  if (isStart) {
    return `${baseNodeStyle} ${
      selected
        ? "border-emerald-500 ring-2 ring-emerald-200 shadow-md"
        : "border-emerald-400 ring-2 ring-emerald-100 shadow-sm"
    }`;
  }
  return `${baseNodeStyle} ${borderClass} ${
    selected ? "ring-2 ring-blue-400 shadow-md border-blue-400" : "hover:shadow-md"
  }`;
}

// Cabeçalho especial exibido quando o nó é o INÍCIO do fluxo (cdMensagem === 0)
function StartHeader({ fluxo }: { fluxo?: string }) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-3 py-1.5 -mx-4 -mt-4 mb-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span className="tracking-wider">INÍCIO ({fluxo?.toUpperCase() || "FLUXO"})</span>
      </div>
      <span
        className="text-[10px] bg-emerald-800/60 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 text-emerald-100"
        title="Nó inicial obrigatório"
      >
        <Lock className="w-3 h-3" />
        <span>Fixo</span>
      </span>
    </div>
  );
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

/* Componente para exibir um nó de texto seco (AZUL) */
export const TextNode = ({ data, selected }: NodeProps) => {
  const isStart = data.cdMensagem === 0;

  return (
    <div className={nodeStyle(selected, isStart, "border-sky-300")}>
      <AutoHandles />
      {isStart && <StartHeader fluxo={data.fluxo} />}

      <div className="flex justify-between items-center mb-2.5 pb-1.5 border-b border-sky-100">
        <div className="flex items-center gap-1.5 font-bold text-xs text-sky-700 tracking-wide uppercase">
          <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
          <span>{data.label || (isStart ? "Mensagem Inicial" : "Texto")}</span>
        </div>
        {data.isFinalizar && (
          <span className="bg-zinc-100 text-zinc-500 text-[10px] font-mono px-2 py-0.5 rounded">
            fim de fluxo
          </span>
        )}
      </div>

      <div className="text-sm text-zinc-700 bg-sky-50/50 p-2.5 rounded border border-sky-100/80">
        {data.text || <span className="italic text-zinc-400">Mensagem vazia...</span>}
      </div>
    </div>
  );
};

/* Componente para exibir um nó de pergunta (ROXO) */
export const QuestionNode = ({ data, selected }: NodeProps) => {
  const isStart = data.cdMensagem === 0;

  return (
    <div className={nodeStyle(selected, isStart, "border-purple-300")}>
      <AutoHandles />
      {isStart && <StartHeader fluxo={data.fluxo} />}

      <div className="flex justify-between items-center mb-2.5 pb-1.5 border-b border-purple-100">
        <div className="flex items-center gap-1.5 font-bold text-xs text-purple-700 tracking-wide uppercase">
          <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
          <span>Aguardar Resposta</span>
        </div>
        {data.idCampo && (
          <span className="bg-purple-100 text-purple-700 text-[10px] font-mono px-2 py-0.5 rounded border border-purple-200">
            salva em campo
          </span>
        )}
      </div>

      <div className="text-sm text-zinc-700 bg-purple-50/50 p-2.5 rounded border border-purple-100/80">
        {data.text || <span className="italic text-zinc-400">Pergunta vazia...</span>}
      </div>
    </div>
  );
};

/* Componente para exibir um nó de escolhas (ÂMBAR / LARANJA) */
export const ButtonsNode = ({ data, selected }: NodeProps) => {
  const isStart = data.cdMensagem === 0;

  return (
    <div className={nodeStyle(selected, isStart, "border-amber-300")}>
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className={`${handleStyle} bg-zinc-100`}
      />

      {isStart && <StartHeader fluxo={data.fluxo} />}

      <div className="flex justify-between items-center mb-2.5 pb-1.5 border-b border-amber-100">
        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 tracking-wide uppercase">
          <List className="w-3.5 h-3.5 text-amber-500" />
          <span>Menu de Opções</span>
        </div>
      </div>

      <div className="text-sm text-zinc-700 bg-amber-50/50 p-2.5 rounded border border-amber-100/80 mb-3">
        {data.text || <span className="italic text-zinc-400">Mensagem vazia...</span>}
      </div>

      <div className="flex flex-col gap-2">
        {(data.buttons ?? []).map((btn) => (
          <div
            key={btn.id}
            className="relative bg-white border border-amber-200 rounded p-2 text-sm text-center text-zinc-700 font-medium hover:bg-amber-50/50"
          >
            {btn.label}

            <Handle
              id={`${btn.id}-top`}
              type="source"
              position={Position.Top}
              style={{ top: "-4px", left: "50%" }}
              className={`${handleStyle} bg-amber-500`}
            />
            <Handle
              id={`${btn.id}-right`}
              type="source"
              position={Position.Right}
              style={{ top: "50%", right: "-4px" }}
              className={`${handleStyle} bg-amber-500`}
            />
            <Handle
              id={`${btn.id}-bottom`}
              type="source"
              position={Position.Bottom}
              style={{ bottom: "-4px", left: "50%" }}
              className={`${handleStyle} bg-amber-500`}
            />
            <Handle
              id={`${btn.id}-left`}
              type="source"
              position={Position.Left}
              style={{ top: "50%", left: "-4px" }}
              className={`${handleStyle} bg-amber-500`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===================== NÓ ESPECIAL DE TRANSFERÊNCIA (ÍNDIGO) ===================== */
const TRANSFER_LABEL: Record<string, string> = {
  P: "Transferir: Atendente",
  I: "Transferir: IA",
};

export const TransferNode = ({ data, selected }: NodeProps) => {
  const isStart = data.cdMensagem === 0;
  const status = data.sgChatStatus ?? "H";

  return (
    <div className={`${nodeStyle(selected, isStart, "border-indigo-300")} border-l-4 border-l-indigo-500`}>
      <AutoHandles />
      {isStart && <StartHeader fluxo={data.fluxo} />}

      <div className="flex justify-between items-center mb-2.5 pb-1.5 border-b border-indigo-100">
        <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 tracking-wide uppercase">
          <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
          <span>{TRANSFER_LABEL[status] ?? "Transferência"}</span>
        </div>
        <SetorBadge idSetor={data.idSetor} />
      </div>

      <div className="text-sm font-medium text-zinc-700 bg-indigo-50/50 p-2.5 rounded border border-indigo-100/80">
        {data.text || <span className="italic text-zinc-400">Sem mensagem...</span>}
      </div>
    </div>
  );
};

/* ===================== NÓ ESPECIAL DE FINALIZAÇÃO (ROSA / SLATE) ===================== */
export const EndNode = ({ data, selected }: NodeProps) => {
  const isStart = data.cdMensagem === 0;

  return (
    <div className={`${nodeStyle(selected, isStart, "border-rose-300")} border-l-4 border-l-rose-500`}>
      <AutoHandles />
      {isStart && <StartHeader fluxo={data.fluxo} />}

      <div className="flex justify-between items-center mb-2.5 pb-1.5 border-b border-rose-100">
        <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700 tracking-wide uppercase">
          <StopCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Fim de Atendimento</span>
        </div>
        <SetorBadge idSetor={data.idSetor} />
      </div>

      <div className="text-sm font-medium text-zinc-700 bg-rose-50/50 p-2.5 rounded border border-rose-100/80">
        {data.text || <span className="italic text-zinc-400">Sem mensagem...</span>}
      </div>
    </div>
  );
};