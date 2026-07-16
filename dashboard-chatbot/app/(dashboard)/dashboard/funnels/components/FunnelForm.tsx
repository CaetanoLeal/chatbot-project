//app/(dashboard)/dashboard/funnels/components/FunnelForm.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import { TextNode, QuestionNode, ButtonsNode, ActionNode } from "./CustomNode";
import { getAutoRoutedEdges } from "./AutoHandles";
import NodeInspector from "./NodeInspector";
import FunilConfigModal from "./FunilConfigModal";
import * as api from "../lib/api";
import type { Campo, Setor } from "../lib/api";
import { funilParaFluxo, fluxoParaFunil, FlowNodeData } from "../lib/transform";

//definindo nodes que criamos em customNode.tsx para serem usados no ReactFlow
const nodeTypes = {
  textNode: TextNode,
  questionNode: QuestionNode,
  buttonsNode: ButtonsNode,
  actionNode: ActionNode,
};

// Definindo as opções de estilo para as arestas do grafo
const edgeOptions = {
  animated: true,
  style: { stroke: "#94a3b8", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
};

type Props = {
  idFunil: string;
};

// Função para calcular o próximo código de mensagem com base nos nós existentes e no fluxo (cadastro ou chatbot)
function proximoCodigo(nodes: Node<FlowNodeData>[], fluxo: "cadastro" | "chatbot") {
  const codigos = nodes.filter((n) => n.data.fluxo === fluxo).map((n) => n.data.cdMensagem);
  return codigos.length === 0 ? 0 : Math.max(...codigos) + 1;
}

// Função principal do componente FunnelFlowBuilder, responsável por renderizar o construtor de fluxo do funil
export default function FunnelFlowBuilder({ idFunil }: Props) {
  const [nodes, setNodes] = useNodesState<FlowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

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
    console.log("ID recebido:", idFunil);
    let ativo = true;

    (async () => {
      try {
        console.log("Buscando:", idFunil);
        setLoading(true);
        const funil = await api.buscarFunil(idFunil);
        console.log("FUNIL:", funil);
        if (!ativo) return;

        const { nodes: n, edges: e } = funilParaFluxo(funil);
        setNodes(n);
        setEdges(getAutoRoutedEdges(n, e));
        setCampos(funil.campos);
        setSetores(funil.setores);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFunil]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
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

  function updateNodeData(nodeId: string, patch: Partial<Node<FlowNodeData>> & { data?: Partial<FlowNodeData> }) {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, ...patch, data: { ...n.data, ...(patch.data ?? {}) } } : n))
    );
  }

  function removeNode(nodeId: string) {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  }

  function addMessage(fluxo: "cadastro" | "chatbot") {
    const cdMensagem = proximoCodigo(nodes, fluxo);
    const prefixo = fluxo === "cadastro" ? "cad" : "bot";
    const doMesmoFluxo = nodes.filter((n) => n.data.fluxo === fluxo);
    const baseX = doMesmoFluxo.length > 0 ? Math.max(...doMesmoFluxo.map((n) => n.position.x)) + 380 : 0;

    const novoNode: Node<FlowNodeData> = {
      id: `${prefixo}-${cdMensagem}`,
      type: "textNode",
      position: { x: baseX, y: 40 },
      data: {
        text: "",
        fluxo,
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
    return <div className="w-full h-screen flex items-center justify-center text-zinc-400 text-sm">Carregando funil…</div>;
  }

  return (
    <div className="w-full h-screen flex">
      <div className="flex-1 relative">
        {/* TOOLBAR */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
          <span className="text-sm font-semibold text-zinc-700">{funilNome}</span>
          <div className="w-px h-5 bg-zinc-200 mx-1" />
          <button onClick={() => addMessage("cadastro")} className="text-xs bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded">
            + Mensagem de Cadastro
          </button>
          <button onClick={() => addMessage("chatbot")} className="text-xs bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded">
            + Mensagem de Chatbot
          </button>
          <button onClick={() => setConfigModal("campos")} className="text-xs bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded">
            Campos
          </button>
          <button onClick={() => setConfigModal("setores")} className="text-xs bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded">
            Setores
          </button>
          <button
            onClick={salvar}
            disabled={saving}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar fluxo"}
          </button>
        </div>

        {error && (
          <div className="absolute top-16 left-4 z-10 bg-red-50 text-red-600 text-xs px-3 py-2 rounded shadow max-w-sm">
            {error}
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
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
          <Background variant={BackgroundVariant.Dots} gap={20} />
          <Controls />
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