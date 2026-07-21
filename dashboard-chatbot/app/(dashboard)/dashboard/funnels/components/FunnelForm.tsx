"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation"; // <-- IMPORTADO AQUI
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  addEdge,
  BackgroundVariant,
  MarkerType,
  applyNodeChanges,
  NodeChange,
  updateEdge,
} from "reactflow";
// @ts-ignore
import "reactflow/dist/style.css";

import { TextNode, QuestionNode, ButtonsNode, TransferNode, EndNode } from "./CustomNode";
const nodeTypes = {
  textNode: TextNode,
  questionNode: QuestionNode,
  buttonsNode: ButtonsNode,
  transferNode: TransferNode,
  endNode: EndNode,
};
import { getAutoRoutedEdges } from "./AutoHandles";
import NodeInspector from "./NodeInspector";
import FunilConfigModal from "./FunilConfigModal";
import * as api from "../lib/api";
import type { Campo, Setor, Setores } from "../lib/api";
import { funilParaFluxo, fluxoParaFunil, FlowNodeData } from "../lib/transform";

const edgeOptions = {
  animated: true,
  style: { stroke: "#94a3b8", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
};

type Props = {
  idFunil: string;
};

function proximoCodigo(nodes: Node<FlowNodeData>[], fluxo: "cadastro" | "chatbot") {
  const codigos = nodes.filter((n) => n.data.fluxo === fluxo).map((n) => n.data.cdMensagem);
  return codigos.length === 0 ? 0 : Math.max(...codigos) + 1;
}

export default function FunnelFlowBuilder({ idFunil }: Props) {
  const searchParams = useSearchParams(); // <-- INSTANCIADO AQUI

  // ESTADOS GLOBAIS
  const [nodes, setNodes] = useNodesState<FlowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  // ESTADO DA ABA ATIVA (Lê o parâmetro da URL se existir, senão usa "cadastro" como padrão)
  const initialFlow = searchParams.get("flow");
  const [activeFlow, setActiveFlow] = useState<"cadastro" | "chatbot">(
    initialFlow === "chatbot" ? "chatbot" : "cadastro"
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [funilNome, setFunilNome] = useState("");

  const [campos, setCampos] = useState<Campo[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [configModal, setConfigModal] = useState<"campos" | "setores" | null>(null);

  /* ===================== CARGA INICIAL DO BANCO ===================== */
  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        setLoading(true);
        const [funil, todosCampos, todosSetores] = await Promise.all([
          api.buscarFunil(idFunil),
          api.listarCampos(),
          api.listarSetores(),
        ]);

        if (!ativo) return;

        const { nodes: n, edges: e } = funilParaFluxo(funil);
        setNodes(n);
        setEdges(getAutoRoutedEdges(n, e));

        setCampos(todosCampos);
        setSetores(todosSetores);
        setFunilNome(funil.name);
      } catch (err: any) {
        if (ativo) setError(err.message ?? "Erro ao carregar funil");
      } finally {
        if (ativo) setLoading(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [idFunil, setNodes, setEdges]);

  /* ===================== TROCA DE ABA ===================== */
  useEffect(() => {
    setSelectedNodeId(null);
  }, [activeFlow]);

  /* ===================== FILTROS DE VISUALIZAÇÃO ===================== */
  const visibleNodes = useMemo(
    () => nodes.filter((n) => n.data.fluxo === activeFlow),
    [nodes, activeFlow]
  );

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) =>
          visibleNodes.some((n) => n.id === e.source) &&
          visibleNodes.some((n) => n.id === e.target)
      ),
    [edges, visibleNodes]
  );

  const selectedNode = useMemo(
    () => visibleNodes.find((n) => n.id === selectedNodeId) ?? null,
    [visibleNodes, selectedNodeId]
  );

  /* ===================== EDIÇÃO DO GRAFO ===================== */
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        setEdges((eds) => getAutoRoutedEdges(updated, eds));
        return updated;
      });
    },
    [setNodes, setEdges]
  );

  /* ===================== CONEXÕES ===================== */
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const novo = addEdge({ ...params, ...edgeOptions, data: { isManual: true } }, eds);
        return getAutoRoutedEdges(nodes, novo);
      });
    },
    [nodes, setEdges]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) =>
        // @ts-ignore
        updateEdge(oldEdge, { ...newConnection, data: { ...oldEdge.data, isManual: true } }, els)
      );
    },
    [setEdges]
  );

  /* ===================== MANIPULAÇÃO DE NÓS ===================== */
  function updateNodeData(
    nodeId: string,
    patch: Partial<Node<FlowNodeData>> & { data?: Partial<FlowNodeData> }
  ) {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, ...patch, data: { ...n.data, ...(patch.data ?? {}) } } : n
      )
    );
  }

  function removeNode(nodeId: string) {
    const targetNode = nodes.find((n) => n.id === nodeId);

    if (targetNode?.data.cdMensagem === 0) {
      alert("⚠️ A mensagem inicial (Início) é obrigatória para o funcionamento do funil e não pode ser excluída.");
      return;
    }

    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  }

  function addMessage() {
    const cdMensagem = proximoCodigo(nodes, activeFlow);
    const prefixo = activeFlow === "cadastro" ? "cad" : "bot";
    const baseX =
      visibleNodes.length > 0 ? Math.max(...visibleNodes.map((n) => n.position.x)) + 380 : 0;

    const novoNode: Node<FlowNodeData> = {
      id: `${prefixo}-${cdMensagem}`,
      type: "textNode",
      position: { x: baseX, y: 40 },
      data: {
        text: "",
        fluxo: activeFlow,
        cdMensagem,
        buttons: [],
        isFinalizar: false,
        idCampo: null,
        idSetor: null,
        sgChatStatus: null,
      },
    };

    setNodes((nds) => [...nds, novoNode]);
    setSelectedNodeId(novoNode.id);
  }

  /* ===================== SALVAR ===================== */
  async function salvar() {
    try {
      setSaving(true);
      setError(null);
      const payload = fluxoParaFunil(nodes, edges);
      await api.salvarEstrutura(idFunil, payload);
      alert("✅ Fluxo salvo com sucesso!");
    } catch (err: any) {
      setError(err.message ?? "Erro ao salvar");
      alert(`❌ ${err.message ?? "Erro ao salvar"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-zinc-400 text-sm">
        Carregando funil…
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex bg-zinc-50/50">
      <div className="flex-1 relative">
        
        {/* TOOLBAR ESQUERDA - Ações do funil */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-sm border border-zinc-200 px-3 py-2">
          <span className="text-sm font-semibold text-zinc-700 truncate max-w-[150px]">
            {funilNome}
          </span>
          <div className="w-px h-5 bg-zinc-200 mx-1" />
          
          <button
            onClick={addMessage}
            className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded transition-colors"
          >
            + Adicionar Mensagem
          </button>
          
          <div className="w-px h-5 bg-zinc-200 mx-1" />
          
          <button
            onClick={() => setConfigModal("campos")}
            className="text-xs text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded transition-colors"
          >
            Campos
          </button>
          <button
            onClick={() => setConfigModal("setores")}
            className="text-xs text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded transition-colors"
          >
            Setores
          </button>
          
          <button
            onClick={salvar}
            disabled={saving}
            className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50 ml-1 shadow-sm"
          >
            {saving ? "Salvando..." : "Salvar fluxo"}
          </button>
        </div>

        {/* SWITCH DIREITA - Cadastro vs Chatbot */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-sm p-1 flex items-center border border-zinc-200">
          <button
            onClick={() => setActiveFlow("cadastro")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeFlow === "cadastro"
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Cadastro
          </button>
          <button
            onClick={() => setActiveFlow("chatbot")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeFlow === "chatbot"
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Chatbot
          </button>
        </div>

        {error && (
          <div className="absolute top-16 left-4 z-10 bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-2 rounded shadow-sm max-w-sm">
            {error}
          </div>
        )}

        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeUpdate={onEdgeUpdate}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} color="#cbd5e1" />
          <Controls className="bg-white border-zinc-200 shadow-sm rounded-md" />
        </ReactFlow>
      </div>

      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          campos={campos}
          setores={setores}
          onClose={() => setSelectedNodeId(null)}
          onChange={updateNodeData}
          onRemove={removeNode}
          onManageCampos={() => setConfigModal("campos")}
          onManageSetores={() => setConfigModal("setores")}
        />
      )}

      {configModal && (
        <FunilConfigModal
          idFunil={idFunil}
          initialTab={configModal}
          onClose={() => setConfigModal(null)}
          onCamposChange={setCampos}
          onSetoresChange={setSetores}
        />
      )}
    </div>
  );
}