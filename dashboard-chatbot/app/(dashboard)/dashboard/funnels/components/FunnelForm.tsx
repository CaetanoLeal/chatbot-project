"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  Minimize2,
  Save,
  X,
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
  initialFlow?: "cadastro" | "chatbot";
  onClose?: () => void;
};

function proximoCodigo(nodes: Node<FlowNodeData>[], fluxo: "cadastro" | "chatbot") {
  const codigos = nodes.filter((n) => n.data.fluxo === fluxo).map((n) => n.data.cdMensagem);
  return codigos.length === 0 ? 0 : Math.max(...codigos) + 1;
}

export default function FunnelFlowBuilder({ idFunil, initialFlow, onClose }: Props) {
  // REFERÊNCIA PARA MODO TELA CHEIA
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ESTADOS GLOBAIS
  const [nodes, setNodes] = useNodesState<FlowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  // ESTADO DA ABA ATIVA
  const [activeFlow, setActiveFlow] = useState<"cadastro" | "chatbot">(
    initialFlow ?? "cadastro"
  );

  useEffect(() => {
    if (initialFlow) {
      setActiveFlow(initialFlow);
    }
  }, [initialFlow]);

  const [rfInstance, setRfInstance] = useState<any>(null);
  const [clipboard, setClipboard] = useState<Node<FlowNodeData>[]>([]);
  const [menu, setMenu] = useState<{ visible: boolean; x: number; y: number; type: "pane" | "node"; nodeId?: string } | null>(null);

  // Estados para Undo/Redo
  const [history, setHistory] = useState<{ nodes: Node<FlowNodeData>[]; edges: Edge[] }[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [savedStep, setSavedStep] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [funilNome, setFunilNome] = useState("");

  const [campos, setCampos] = useState<Campo[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [configModal, setConfigModal] = useState<"campos" | "setores" | "expiracao" | null>(null);

  /* ===================== LISTENER MODO TELA CHEIA ===================== */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => {
        console.error("Erro ao entrar em tela cheia:", err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error("Erro ao sair da tela cheia:", err);
      });
    }
  };

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
        const routedEdges = getAutoRoutedEdges(n, e);
        
        setNodes(n);
        setEdges(routedEdges);
        
        setHistory([{ nodes: n, edges: routedEdges }]);
        setHistoryStep(0);

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

  /* ===================== HISTÓRICO (UNDO/REDO) ===================== */
  const saveSnapshot = useCallback((newNodes: Node<FlowNodeData>[], newEdges: Edge[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push({ nodes: newNodes, edges: newEdges });
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  }, [historyStep]);

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setNodes(history[prevStep].nodes);
      setEdges(history[prevStep].edges);
    }
  }, [history, historyStep, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setNodes(history[nextStep].nodes);
      setEdges(history[nextStep].edges);
    }
  }, [history, historyStep, setNodes, setEdges]);

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

  const onNodeDragStop = useCallback(() => {
    saveSnapshot(nodes, edges);
  }, [nodes, edges, saveSnapshot]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      let nextEdges: Edge[] = [];
      setEdges((eds) => {
        const novo = addEdge({ ...params, ...edgeOptions, data: { isManual: true } }, eds);
        nextEdges = getAutoRoutedEdges(nodes, novo);
        return nextEdges;
      });
      setTimeout(() => saveSnapshot(nodes, nextEdges), 10);
    },
    [nodes, setEdges, saveSnapshot]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) =>
        // @ts-ignore
        updateEdge(oldEdge, { ...newConnection, data: { ...oldEdge.data, isManual: true } }, els)
      );
      setTimeout(() => saveSnapshot(nodes, edges), 10);
    },
    [setEdges, nodes, edges, saveSnapshot]
  );

  /* ===================== SALVAR ===================== */
  const salvar = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = fluxoParaFunil(nodes, edges);
      await api.salvarEstrutura(idFunil, payload);
      setSavedStep(historyStep);
      alert("✅ Fluxo salvo com sucesso!");
    } catch (err: any) {
      setError(err.message ?? "Erro ao salvar");
      alert(`❌ ${err.message ?? "Erro ao salvar"}`);
    } finally {
      setSaving(false);
    }
  }, [nodes, edges, idFunil, historyStep]);

  /* ===================== CLIPBOARD & MANIPULAÇÕES ===================== */
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
      setClipboard(selectedNodes);
      const selectedIds = selectedNodes.map(n => n.id);
      
      const nextNodes = nodes.filter((n) => !selectedIds.includes(n.id));
      const nextEdges = edges.filter((e) => !selectedIds.includes(e.source) && !selectedIds.includes(e.target));
      
      setNodes(nextNodes);
      setEdges(nextEdges);
      saveSnapshot(nextNodes, nextEdges);
      setMenu(null);
    }
  }, [nodes, edges, saveSnapshot, setNodes, setEdges]);

  const handlePaste = useCallback((menuX?: number, menuY?: number) => {
    if (clipboard.length === 0) return;

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

    const nextNodes = nodes.map(n => ({ ...n, selected: false })).concat(newNodes);
    setNodes(nextNodes);
    saveSnapshot(nextNodes, edges);
    setMenu(null);
  }, [clipboard, nodes, edges, activeFlow, saveSnapshot, setNodes, rfInstance]);

  const handleDelete = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    const hasStartNode = selectedNodes.some(n => n.data.cdMensagem === 0);
    if (hasStartNode) {
      alert("⚠️ A mensagem inicial (Início) é obrigatória para o funcionamento do funil e não pode ser excluída.");
      return;
    }

    const selectedIds = selectedNodes.map(n => n.id);
    const nextNodes = nodes.filter((n) => !selectedIds.includes(n.id));
    const nextEdges = edges.filter((e) => !selectedIds.includes(e.source) && !selectedIds.includes(e.target));

    setNodes(nextNodes);
    setEdges(nextEdges);
    saveSnapshot(nextNodes, nextEdges);
    setMenu(null);
  }, [nodes, edges, saveSnapshot, setNodes, setEdges]);

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

  /* ===================== FECHAR ===================== */
  const hasUnsavedChanges = historyStep !== savedStep;

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmar = window.confirm(
        "Você tem alterações não salvas neste painel. Se sair agora, elas serão perdidas. Deseja continuar?"
      );
      if (!confirmar) return;
    }
    
    // Força saída de tela cheia se estiver, antes de fechar o painel
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(()=>{});
    }

    if (onClose) {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  /* ===================== ATALHOS DE TECLADO ===================== */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c': e.preventDefault(); handleCopy(); break;
          case 'v': e.preventDefault(); handlePaste(); break;
          case 'x': e.preventDefault(); handleCut(); break;
          case 'z': e.preventDefault(); handleUndo(); break;
          case 'y': e.preventDefault(); handleRedo(); break;
          case 's': e.preventDefault(); salvar(); break;
          case 'p': e.preventDefault(); handleFitView(); break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handlePaste, handleCut, handleUndo, handleRedo, handleFitView, handleDelete, salvar]);

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

  const handleMoveStart = useCallback(() => {
    if (menu) setMenu(null);
  }, [menu]);

  useEffect(() => {
    const closeMenu = () => setMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  /* ===================== MANIPULAÇÃO DE NÓS (INDIVIDUAL) ===================== */
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

    const nextNodes = nodes.filter((n) => n.id !== nodeId);
    const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

    setNodes(nextNodes);
    setEdges(nextEdges);
    saveSnapshot(nextNodes, nextEdges);

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

    const nextNodes = [...nodes, novoNode];
    setNodes(nextNodes);
    saveSnapshot(nextNodes, edges);

    setSelectedNodeId(novoNode.id);
    setMenu(null);
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
        Carregando funil…
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full h-full flex bg-zinc-50 relative">
      <style>{`
        .react-flow__pane, .react-flow__node {
          cursor: default !important;
        }
      `}</style>
      
      <div className="flex-1 relative h-full">
        
        {/* HEADER RESPONSIVO */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-start justify-between gap-3 pointer-events-none">
            
            {/* TOOLBAR ESQUERDA */}
            <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg shadow-sm border border-zinc-200 px-3 py-2 pointer-events-auto max-w-full">
              <span className="text-sm font-semibold text-zinc-700 truncate max-w-[150px]">
                {funilNome}
              </span>
              <div className="w-px h-5 bg-zinc-200 mx-1 hidden sm:block" />
              
              <button
                onClick={salvar}
                disabled={saving}
                className="text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50 ml-1 shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? "Salvando..." : "Salvar"}
              </button>

              <div className="w-px h-5 bg-zinc-200 mx-1 hidden sm:block" />

              <button
                onClick={handleUndo}
                disabled={historyStep <= 0}
                title="Desfazer (Ctrl+Z)"
                className="text-zinc-500 hover:text-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-500 p-1.5 rounded hover:bg-zinc-100"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyStep >= history.length - 1}
                title="Refazer (Ctrl+Y)"
                className="text-zinc-500 hover:text-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-500 p-1.5 rounded hover:bg-zinc-100"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-5 bg-zinc-200 mx-1 hidden sm:block" />
              
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
                onClick={() => setConfigModal("expiracao")}
                className="text-xs text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded transition-colors"
              >
                Expiração
              </button>
              <div className="w-px h-5 bg-zinc-200 mx-1 hidden sm:block" />

              <button
                onClick={() => addMessage()}
                className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Mensagem
              </button>

              <div className="w-px h-5 bg-zinc-200 mx-1 hidden sm:block" />

              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
                className="text-zinc-500 hover:text-zinc-800 p-1.5 rounded hover:bg-zinc-100"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleClose}
                title="Fechar editor"
                className="text-zinc-500 hover:text-red-600 p-1.5 rounded hover:bg-red-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SWITCH DIREITA */}
            <div className="bg-white rounded-lg shadow-sm p-1 flex items-center border border-zinc-200 pointer-events-auto shrink-0">
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
          </div>

          {error && (
            <div className="absolute top-28 left-4 z-10 bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-2 rounded shadow-sm max-w-sm pointer-events-auto">
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
          onNodeDragStop={onNodeDragStop}
          onMoveStart={handleMoveStart}
          onConnect={onConnect}
          onEdgeUpdate={onEdgeUpdate}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          deleteKeyCode={null}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
        >
          {/* ===================== MENU DE CONTEXTO ===================== */}
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
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-100 text-left text-sky-600 font-medium" onClick={salvar}>
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
          
            {/* ===================== BACKGROUND PRO EDITOR ===================== */}
            <Background
              id="minor"
              variant={BackgroundVariant.Lines}
              gap={24}
              color="#e9f0f7"
              lineWidth={1}
            />

            <Background
              id="major"
              variant={BackgroundVariant.Cross}
              gap={120}
              size={12}
              color="#006aff6e"
              lineWidth={1.5}
              style={{ opacity: 0.5 }}
            />
          <Controls className="bg-white border border-zinc-200 shadow-sm rounded-md overflow-hidden flex flex-col" showInteractive={false} />
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