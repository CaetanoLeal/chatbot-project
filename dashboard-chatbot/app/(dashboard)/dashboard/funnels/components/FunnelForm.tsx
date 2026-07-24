"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

import {
  Plus,
  Clipboard,
  Scissors,
  Copy,
  Trash2,
  ArrowRightLeft,
  Undo2,
  Redo2,
  Maximize2,
  Save,
} from "lucide-react";

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
  const searchParams = useSearchParams();

  // ESTADOS GLOBAIS
  const [nodes, setNodes] = useNodesState<FlowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  // ESTADO DA ABA ATIVA
  const initialFlow = searchParams.get("flow");
  const [activeFlow, setActiveFlow] = useState<"cadastro" | "chatbot">(
    initialFlow === "chatbot" ? "chatbot" : "cadastro"
  );

  // Estados para a instância do React Flow, Clipboard e Menu de Contexto
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [clipboard, setClipboard] = useState<Node<FlowNodeData>[]>([]);
  const [menu, setMenu] = useState<{ visible: boolean; x: number; y: number; type: "pane" | "node"; nodeId?: string } | null>(null);

  // Estados para Undo/Redo
  const [history, setHistory] = useState<{ nodes: Node<FlowNodeData>[]; edges: Edge[] }[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

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

  /* ===================== HISTÓRICO (UNDO/REDO) ===================== */
  const takeSnapshot = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push({ nodes, edges });
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  }, [nodes, edges, historyStep]);

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep((prev) => prev - 1);
      setNodes(history[historyStep - 1].nodes);
      setEdges(history[historyStep - 1].edges);
    }
  }, [history, historyStep, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep((prev) => prev + 1);
      setNodes(history[historyStep + 1].nodes);
      setEdges(history[historyStep + 1].edges);
    }
  }, [history, historyStep, setNodes, setEdges]);

  /* ===================== CLIPBOARD (COPY/CUT/PASTE/DELETE) ===================== */
  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length > 0) {
      setClipboard(selectedNodes);
      setMenu(null);
    }
  }, [nodes]);

  const handleCut = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length > 0) {
      takeSnapshot();
      setClipboard(selectedNodes);
      const selectedIds = selectedNodes.map(n => n.id);
      setNodes((nds) => nds.filter((n) => !selectedIds.includes(n.id)));
      setEdges((eds) => eds.filter((e) => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
      setMenu(null);
    }
  }, [nodes, takeSnapshot, setNodes, setEdges]);

  const handlePaste = useCallback((menuX?: number, menuY?: number) => {
    if (clipboard.length === 0) return;
    takeSnapshot();

    let currentCdMensagem = proximoCodigo(nodes, activeFlow);
    const prefixo = activeFlow === "cadastro" ? "cad" : "bot";

    let startX = clipboard[0].position.x + 30;
    let startY = clipboard[0].position.y + 30;

    if (menuX !== undefined && menuY !== undefined && rfInstance) {
      const flowPos = rfInstance.screenToFlowPosition({ x: menuX, y: menuY });
      startX = flowPos.x;
      startY = flowPos.y;
    }

    const newNodes = clipboard.map((node, index) => {
      const novoId = `${prefixo}-${currentCdMensagem + index}`;
      return {
        ...node,
        id: novoId,
        position: { x: startX + (index * 30), y: startY + (index * 30) },
        selected: true,
        data: {
          ...node.data,
          cdMensagem: currentCdMensagem + index,
          fluxo: activeFlow
        }
      };
    });

    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
    setMenu(null);
  }, [clipboard, nodes, activeFlow, takeSnapshot, setNodes, rfInstance]);

  const handleFitView = useCallback(() => {
    if (rfInstance) {
      rfInstance.fitView({ padding: 0.2, duration: 800 });
      setMenu(null);
    }
  }, [rfInstance]);

  /* ===================== AUTO FIT VIEW ===================== */
  useEffect(() => {
    if (rfInstance) {
      const timer = setTimeout(() => {
        handleFitView();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [activeFlow, rfInstance, handleFitView]);

  /* ===================== ATALHOS DE TECLADO ===================== */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c': handleCopy(); break;
          case 'v': handlePaste(); break;
          case 'x': handleCut(); break;
          case 'z': handleUndo(); break;
          case 'y': handleRedo(); break;
          case 'p':
            e.preventDefault();
            handleFitView();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handlePaste, handleCut, handleUndo, handleRedo, handleFitView]);

  /* ===================== MENUS DE CONTEXTO ===================== */
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setNodes((nds) => nds.map(n => ({ ...n, selected: n.id === node.id })));
    setMenu({ visible: true, x: event.clientX, y: event.clientY, type: "node", nodeId: node.id });
  }, [setNodes]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setMenu({ visible: true, x: event.clientX, y: event.clientY, type: "pane" });
  }, []);

  // Fecha o menu ao arrastar a tela ou dar zoom (movimentação do grafo)
  const handleMoveStart = useCallback(() => {
    if (menu) setMenu(null);
  }, [menu]);

  // Fecha o menu ao clicar em qualquer outro lugar fora dele
  useEffect(() => {
    const closeMenu = () => setMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

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
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }

  function addMessage(menuX?: number, menuY?: number) {
    const cdMensagem = proximoCodigo(nodes, activeFlow);
    const prefixo = activeFlow === "cadastro" ? "cad" : "bot";
    
    let posX = visibleNodes.length > 0 ? Math.max(...visibleNodes.map((n) => n.position.x)) + 380 : 0;
    let posY = 40;

    if (menuX !== undefined && menuY !== undefined && rfInstance) {
      const flowPos = rfInstance.screenToFlowPosition({ x: menuX, y: menuY });
      posX = flowPos.x;
      posY = flowPos.y;
    }

    const novoNode: Node<FlowNodeData> = {
      id: `${prefixo}-${cdMensagem}`,
      type: "textNode",
      position: { x: posX, y: posY },
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
    setMenu(null);
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
      <style>{`
        .react-flow__pane, .react-flow__node {
          cursor: default !important;
        }
      `}</style>
      
      <div className="flex-1 relative">
        
        {/* TOOLBAR ESQUERDA */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-sm border border-zinc-200 px-3 py-2">
          <span className="text-sm font-semibold text-zinc-700 truncate max-w-[150px]">
            {funilNome}
          </span>
          <div className="w-px h-5 bg-zinc-200 mx-1" />
          
          <button
            onClick={() => addMessage()}
            className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Mensagem
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
            className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50 ml-1 shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? "Salvando..." : "Salvar fluxo"}
          </button>
        </div>

        {/* SWITCH DIREITA */}
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
          onInit={setRfInstance}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onMoveStart={handleMoveStart}
          onConnect={(params) => {
            takeSnapshot();
            onConnect(params);
          }}
          onEdgeUpdate={onEdgeUpdate}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
        >
          {/* ===================== MENU DE CONTEXTO COM ÍCONES ===================== */}
          {menu && menu.visible && (
            <div
              className="fixed z-50 bg-white border border-zinc-200 shadow-xl rounded-md py-1.5 min-w-[200px] text-xs text-zinc-700"
              style={{ top: menu.y, left: menu.x }}
            >
              {menu.type === "pane" ? (
                <>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-100 text-left font-medium text-blue-600" onClick={() => addMessage(menu.x, menu.y)}>
                    <Plus className="w-4 h-4" /> Nova Mensagem
                  </button>
                  <div className="border-t border-zinc-100 my-1"></div>
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-100 text-left" onClick={() => handlePaste(menu.x, menu.y)} disabled={clipboard.length === 0}>
                    <span className="flex items-center gap-2.5"><Clipboard className="w-4 h-4 text-zinc-500" /> Colar</span> 
                    <span className="text-zinc-400 text-[10px]">Ctrl+V</span>
                  </button>
                  <div className="border-t border-zinc-100 my-1"></div>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-100 text-left" onClick={() => setActiveFlow("cadastro")}>
                    <ArrowRightLeft className="w-4 h-4 text-zinc-500" /> Ir para Cadastro
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-100 text-left" onClick={() => setActiveFlow("chatbot")}>
                    <ArrowRightLeft className="w-4 h-4 text-zinc-500" /> Ir para Chatbot
                  </button>
                  <div className="border-t border-zinc-100 my-1"></div>
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-100 text-left" onClick={handleUndo}>
                    <span className="flex items-center gap-2.5"><Undo2 className="w-4 h-4 text-zinc-500" /> Desfazer</span> 
                    <span className="text-zinc-400 text-[10px]">Ctrl+Z</span>
                  </button>
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-100 text-left" onClick={handleRedo}>
                    <span className="flex items-center gap-2.5"><Redo2 className="w-4 h-4 text-zinc-500" /> Refazer</span> 
                    <span className="text-zinc-400 text-[10px]">Ctrl+Y</span>
                  </button>
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-100 text-left" onClick={handleFitView}>
                    <span className="flex items-center gap-2.5"><Maximize2 className="w-4 h-4 text-zinc-500" /> Fit View</span> 
                    <span className="text-zinc-400 text-[10px]">Ctrl+P</span>
                  </button>
                  <div className="border-t border-zinc-100 my-1"></div>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-100 text-left text-emerald-600 font-medium" onClick={salvar}>
                    <Save className="w-4 h-4" /> Salvar Fluxo
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-100 text-left" onClick={handleCut}>
                    <span className="flex items-center gap-2.5"><Scissors className="w-4 h-4 text-zinc-500" /> Recortar</span> 
                    <span className="text-zinc-400 text-[10px]">Ctrl+X</span>
                  </button>
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-100 text-left" onClick={handleCopy}>
                    <span className="flex items-center gap-2.5"><Copy className="w-4 h-4 text-zinc-500" /> Copiar</span> 
                    <span className="text-zinc-400 text-[10px]">Ctrl+C</span>
                  </button>
                  <div className="border-t border-zinc-100 my-1"></div>
                  <button 
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-red-50 text-red-600 text-left" 
                    onClick={() => { if(menu.nodeId) removeNode(menu.nodeId); setMenu(null); }}
                  >
                    <span className="flex items-center gap-2.5"><Trash2 className="w-4 h-4 text-red-500" /> Deletar</span> 
                    <span className="text-red-300 text-[10px]">Del</span>
                  </button>
                </>
              )}
            </div>
          )}
          <>
            <>
              <Background
                id="major"
                variant={BackgroundVariant.Dots}
                gap={96}
                size={3}
                color="#cbd5e1"
              />

              <Background
                id="minor"
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1.2}
                color="#e5e7eb"
              />
            </>
          </>
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