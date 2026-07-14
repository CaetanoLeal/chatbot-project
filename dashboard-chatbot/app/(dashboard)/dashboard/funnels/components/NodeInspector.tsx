//app/(dashboard)/dashboard/funnels/components/NodeInspector.tsx
"use client"

import { Node } from "reactflow"
import type { FlowNodeData } from "../lib/transform"
import type { Campo, Setor } from "../lib/api"

type NodeKind = "textNode" | "questionNode" | "buttonsNode" | "actionNode"

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

const TIPO_OPTIONS: { value: NodeKind; label: string; help: string }[] = [
  { value: "textNode", label: "Mensagem de texto", help: "Envia e segue direto para o destino conectado." },
  { value: "questionNode", label: "Aguardar resposta", help: "Envia e espera o usuário responder antes de seguir." },
  { value: "buttonsNode", label: "Menu de opções", help: "Envia com botões numerados; o destino depende da escolha." },
  { value: "actionNode", label: "Finalizar atendimento", help: "Encerra este fluxo e direciona o status da conversa." },
]

const STATUS_OPTIONS: { value: "A" | "H" | "I" | "P"; label: string }[] = [
  { value: "A", label: "Aberto — bot reinicia na próxima mensagem" },
  { value: "H", label: "Atendente humano" },
  { value: "I", label: "Inteligência artificial" },
  { value: "P", label: "Pendente — aguardando atendente" },
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

  function setData(patch: Partial<FlowNodeData>) {
    onChange(node.id, { data: { ...data, ...patch } })
  }

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

    if (novoTipo === "actionNode") {
      patch.isFinalizar = true
      if (data.fluxo === "chatbot" && !data.sgChatStatus) patch.sgChatStatus = "H"
    } else if (novoTipo === "textNode" && data.fluxo === "cadastro") {
      // no cadastro, "Finalizar" é só um textNode com isFinalizar = true
      // (o usuário ativa isso pelo checkbox abaixo, não pelo tipo)
    } else {
      patch.isFinalizar = false
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
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {isInicio ? "Mensagem inicial" : `Mensagem ${data.cdMensagem}`}
          <span className="ml-2 text-[10px] font-normal text-zinc-400 uppercase">{data.fluxo}</span>
        </h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-sm">
          ✕
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Tipo de mensagem</label>
        <select
          className="border rounded px-2 py-1.5 w-full text-sm"
          value={kind}
          onChange={(e) => setTipo(e.target.value as NodeKind)}
        >
          {TIPO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-zinc-400 mt-1">
          {TIPO_OPTIONS.find((o) => o.value === kind)?.help}
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Texto</label>
        <textarea
          className="border rounded px-2 py-1.5 w-full text-sm min-h-[90px]"
          value={data.text}
          onChange={(e) => setData({ text: e.target.value })}
          placeholder="Use {no_campo} para inserir dados já coletados"
        />
      </div>

      {kind === "questionNode" && (
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
            <option value="">Nenhum (só aguarda, não salva)</option>
            {campos.map((c) => (
              <option key={c.id_campo} value={c.id_campo}>
                {c.ds_label || c.no_campo} ({c.ds_campo_tipo})
              </option>
            ))}
          </select>
        </div>
      )}

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
                <button onClick={() => removeButton(idx)} className="text-red-500 text-sm px-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button onClick={addButton} className="text-blue-600 text-xs mt-2">
            + adicionar botão
          </button>
          <p className="text-[11px] text-zinc-400 mt-2">
            Conecte cada botão a uma mensagem destino puxando uma linha a partir dele no canvas.
          </p>
        </div>
      )}

      {kind === "actionNode" && data.fluxo === "chatbot" && (
        <>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Status ao finalizar</label>
            <select
              className="border rounded px-2 py-1.5 w-full text-sm"
              value={data.sgChatStatus ?? "H"}
              onChange={(e) => setData({ sgChatStatus: e.target.value as any })}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {(data.sgChatStatus === "H" || data.sgChatStatus === "P") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-500">Setor de destino</label>
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
        </>
      )}

      {data.fluxo === "cadastro" && kind === "textNode" && !isInicio && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!data.isFinalizar}
            onChange={(e) => setData({ isFinalizar: e.target.checked })}
          />
          Finalizar cadastro aqui (segue para o chatbot)
        </label>
      )}

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