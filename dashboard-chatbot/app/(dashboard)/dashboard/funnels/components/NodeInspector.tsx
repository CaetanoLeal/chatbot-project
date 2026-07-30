"use client"

import { useEffect, useRef, useState } from "react"
import { Node } from "reactflow"
import type { FlowNodeData } from "../lib/transform"
import type { Campo, Setor } from "../lib/api"

// 1. Tipos atualizados com transferNode e endNode
type NodeKind = "textNode" | "questionNode" | "buttonsNode" | "transferNode" | "endNode"

type Props = {
  node: Node<FlowNodeData>
  campos: Campo[]
  setores: Setor[]
  onClose: () => void
  onChange: (nodeId: string, patch: Partial<Node<FlowNodeData>> & { data?: Partial<FlowNodeData> }) => void
  onRemove: (nodeId: string) => void
  onManageCampos: () => void
  onManageSetores: () => void
}

// 2. Opções separadas (Transferir e Finalizar no lugar do antigo actionNode)
const TIPO_OPTIONS: { value: NodeKind; label: string; help: string }[] = [
  { value: "textNode", label: "Mensagem de texto", help: "Envia e segue direto para o destino conectado." },
  { value: "questionNode", label: "Aguardar resposta", help: "Envia e espera o usuário responder antes de seguir." },
  { value: "buttonsNode", label: "Menu de opções", help: "Envia com botões numerados; o destino depende da escolha." },
  { value: "transferNode", label: "Transferir atendimento", help: "Transfere o usuário para um Setor (IA ou Atendente Humano)." },
  { value: "endNode", label: "Finalizar atendimento", help: "Encerra este fluxo e fecha a conversa." },
]

// 3. Status de transferência
const TRANSFER_TARGETS: { value: "H" | "I" | "P"; label: string }[] = [
  { value: "H", label: "Atendente Humano" },
  { value: "I", label: "Inteligência Artificial (IA)" },
  { value: "P", label: "Fila de Espera" },
]

export default function NodeInspector({
  node,
  campos,
  setores,
  onClose,
  onChange,
  onRemove,
  onManageCampos,
  onManageSetores,
}: Props) {
  const data = node.data
  const kind = node.type as NodeKind
  const isInicio = data.cdMensagem === 0

const textareaRef = useRef<HTMLTextAreaElement>(null)
const camposMenuRef = useRef<HTMLDivElement>(null)
const [showCamposMenu, setShowCamposMenu] = useState(false)

// fecha o dropdown ao clicar fora
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (camposMenuRef.current && !camposMenuRef.current.contains(e.target as globalThis.Node)) {
      setShowCamposMenu(false)
    }
  }
  if (showCamposMenu) document.addEventListener("mousedown", handleClickOutside)
  return () => document.removeEventListener("mousedown", handleClickOutside)
}, [showCamposMenu])

// insere {no_campo} na posição do cursor, sem apagar o que já foi digitado
function inserirCampo(nomeCampo: string) {
  const campoTag = `{${nomeCampo}}`
  const textarea = textareaRef.current
  const textoAtual = data.text || ""

  if (!textarea) {
    setData({ text: textoAtual + campoTag })
    setShowCamposMenu(false)
    return
  }

  const start = textarea.selectionStart ?? textoAtual.length
  const end = textarea.selectionEnd ?? textoAtual.length
  const novoTexto = textoAtual.slice(0, start) + campoTag + textoAtual.slice(end)

  setData({ text: novoTexto })
  setShowCamposMenu(false)

  requestAnimationFrame(() => {
    textarea.focus()
    const novaPos = start + campoTag.length
    textarea.setSelectionRange(novaPos, novaPos)
  })
}

  function setData(patch: Partial<FlowNodeData>) {
    onChange(node.id, { data: { ...data, ...patch } })
  }

  // 4. Lógica adaptada para lidar com transferNode e endNode separadamente
  function setTipo(novoTipo: NodeKind) {
    const patch: Partial<FlowNodeData> = {}

    if (novoTipo === "buttonsNode") {
      patch.isFinalizar = false
      if (!data.buttons || data.buttons.length === 0) {
        patch.buttons = [{ id: "btn-1", label: "" }]
      }
    } else {
      patch.buttons = []
    }

    if (novoTipo === "transferNode") {
      patch.isFinalizar = true
      if (!data.sgChatStatus) patch.sgChatStatus = "H" // Padrão: Humano
    } else if (novoTipo === "endNode") {
      patch.isFinalizar = true
      patch.sgChatStatus = "A" 
    } else if (novoTipo === "textNode" && data.fluxo === "cadastro") {
      // no cadastro, "Finalizar" é só um textNode com isFinalizar = true
    } else {
      patch.isFinalizar = false
      patch.sgChatStatus = undefined
    }

    onChange(node.id, { type: novoTipo, data: { ...data, ...patch } })
  }

  function addButton() {
    const buttons = data.buttons ?? []
    setData({ buttons: [...buttons, { id: `btn-${buttons.length + 1}`, label: "" }] })
  }

  function updateButton(idx: number, label: string) {
    const buttons = [...(data.buttons ?? [])]
    buttons[idx] = { ...buttons[idx], label }
    setData({ buttons })
  }

  function removeButton(idx: number) {
    const buttons = (data.buttons ?? []).filter((_, i) => i !== idx)
    setData({ buttons })
  }

  return (
    <div className="w-80 shrink-0 bg-white border-l border-zinc-200 h-screen overflow-y-auto p-5 space-y-5 text-zinc-700">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {isInicio ? "Mensagem inicial" : `Mensagem ${data.cdMensagem}`}
          <span className="ml-2 text-[10px] font-normal text-zinc-400 uppercase">{data.fluxo}</span>
        </h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-sm">✕</button>
      </div>

      {/* TIPO DA MENSAGEM */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Ação / Tipo de mensagem</label>
        <select
          className="border rounded px-2 py-1.5 w-full text-sm font-medium"
          value={kind}
          onChange={(e) => setTipo(e.target.value as NodeKind)}
        >
          {TIPO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-[11px] text-zinc-400 mt-1">
          {TIPO_OPTIONS.find((o) => o.value === kind)?.help}
        </p>
      </div>

      {/* TEXTO */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-zinc-500">
            Texto {kind === "transferNode" ? "(Opcional - Ex: Transferindo...)" : ""}
          </label>

          <div className="relative" ref={camposMenuRef}>
            <button
              type="button"
              onClick={() => setShowCamposMenu((v) => !v)}
              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
            >
              {"{ }"} inserir campo
            </button>

            {showCamposMenu && (
              <div className="absolute right-0 mt-1 z-20 bg-white border border-zinc-200 rounded shadow-lg w-48 max-h-48 overflow-y-auto text-xs">
                {campos.length === 0 && (
                  <p className="px-3 py-2 text-zinc-400">Nenhum campo cadastrado.</p>
                )}
                {campos.map((c) => (
                  <button
                    key={c.id_campo}
                    type="button"
                    onClick={() => inserirCampo(c.no_campo)}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-100"
                  >
                    {c.ds_label || c.no_campo}
                    <span className="text-zinc-400"> ({c.no_campo})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          className="border rounded px-2 py-1.5 w-full text-sm min-h-[90px]"
          value={data.text || ""}
          onChange={(e) => setData({ text: e.target.value })}
          placeholder="Use {no_campo} para inserir dados já coletados"
        />
      </div>

      {/* TRANSFERÊNCIA (Exibido apenas no transferNode) */}
      {kind === "transferNode" && (
        <div className="space-y-4 bg-indigo-50/50 p-3 border border-indigo-100 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-indigo-700 mb-1">Quem vai atender?</label>
            <select
              className="border border-indigo-200 rounded px-2 py-1.5 w-full text-sm focus:ring-indigo-500"
              value={data.sgChatStatus ?? "H"}
              onChange={(e) => setData({ sgChatStatus: e.target.value as any })}
            >
              {TRANSFER_TARGETS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-indigo-700">Para qual setor?</label>
              <button onClick={onManageSetores} className="text-[10px] text-indigo-600 hover:underline">
                + novo setor
              </button>
            </div>
            <select
              className="border border-indigo-200 rounded px-2 py-1.5 w-full text-sm focus:ring-indigo-500"
              value={data.idSetor ?? ""}
              onChange={(e) => setData({ idSetor: e.target.value || null })}
            >
              <option value="" disabled>Selecione um setor obrigatório...</option>
              {setores.map((s) => (
                <option key={s.id_setor} value={s.id_setor}>{s.no_setor}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* SALVAR RESPOSTA (questionNode e buttonsNode) */}
      {(kind === "questionNode" || kind === "buttonsNode") && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-zinc-500">Salvar resposta no campo</label>
            <button onClick={onManageCampos} className="text-[11px] text-blue-600 hover:underline">
              + novo campo
            </button>
          </div>
          <select
            className="border rounded px-2 py-1.5 w-full text-sm"
            value={data.idCampo ?? ""}
            onChange={(e) => setData({ idCampo: e.target.value || null })}
          >
            <option value="">Nenhum</option>
            {campos.map((c) => (
              <option key={c.id_campo} value={c.id_campo}>
                {c.ds_label || c.no_campo} ({c.ds_campo_tipo})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CONFIGURAÇÃO DE BOTÕES (buttonsNode) */}
      {kind === "buttonsNode" && (
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-2">Botões</label>
          <div className="space-y-2">
            {(data.buttons ?? []).map((btn, idx) => (
              <div key={btn.id} className="flex gap-2">
                <input
                  className="border rounded px-2 py-1 flex-1 text-sm"
                  value={btn.label}
                  placeholder={`Opção ${idx + 1}`}
                  onChange={(e) => updateButton(idx, e.target.value)}
                />
                <button onClick={() => removeButton(idx)} className="text-red-500 text-sm px-1">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addButton} className="text-blue-600 text-xs mt-2">+ adicionar botão</button>
          <p className="text-[11px] text-zinc-400 mt-2">
            Conecte cada botão a uma mensagem destino puxando uma linha a partir dele no canvas.
          </p>
        </div>
      )}

      {/* SETOR GERAL DA MENSAGEM (Oculto se for Transferência, pois a transferência já exibe ele lá em cima) */}
      {kind !== "transferNode" && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-zinc-500">Setor da mensagem</label>
            <button onClick={onManageSetores} className="text-[11px] text-blue-600 hover:underline">
              + novo setor
            </button>
          </div>
          <select
            className="border rounded px-2 py-1.5 w-full text-sm"
            value={data.idSetor ?? ""}
            onChange={(e) => setData({ idSetor: e.target.value || null })}
          >
            <option value="">Nenhum setor específico</option>
            {setores.map((s) => (
              <option key={s.id_setor} value={s.id_setor}>
                {s.no_setor}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* FINALIZAR (Fluxo de Cadastro) */}
      {data.fluxo === "cadastro" && kind === "textNode" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!data.isFinalizar}
            onChange={(e) => setData({ isFinalizar: e.target.checked })}
          />
          Finalizar cadastro aqui (segue para o chatbot)
        </label>
      )}

      {/* APAGAR MENSAGEM */}
      {!isInicio && (
        <button
          onClick={() => onRemove(node.id)}
          className="text-red-600 text-xs border border-red-100 bg-red-50 rounded px-3 py-2 w-full hover:bg-red-100"
        >
          Apagar mensagem
        </button>
      )}
    </div>
  )
}