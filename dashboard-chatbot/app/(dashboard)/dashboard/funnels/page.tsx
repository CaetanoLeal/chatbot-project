'use client'

import { useEffect, useState } from 'react'
import { Plus } from "lucide-react"
import MensagemPredefinidaModal from "./components/MensagemPredefinidaModal"
import FunnelFlowBuilder from "./components/FunnelForm"

type Funil = {
  id: string
  name: string
  description: string
}

export default function FunnelsPage() {
  // ==== ESTADOS DA LISTA ====
  const [funnels, setFunnels] = useState<Funil[]>([])
  const [loading, setLoading] = useState(true)

  // ==== ESTADOS DO MODAL DE EDIÇÃO ====
  const [editingFunil, setEditingFunil] = useState<Funil | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingAction, setSavingAction] = useState(false)
  const [showMensagemModal, setShowMensagemModal] = useState(false)

  // ==== ESTADOS DE NAVEGAÇÃO INTERNA ====
  const [activeView, setActiveView] = useState<"list" | "editor">("list")
  const [editorMode, setEditorMode] = useState<"new" | "flow" | null>(null)
  const [activeFunilId, setActiveFunilId] = useState<string | null>(null)
  const [initialFlowType, setInitialFlowType] = useState<"cadastro" | "chatbot">("cadastro")

  // ==== ESTADOS DO NOVO FUNIL ====
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    carregarFunis()
  }, [])

  async function carregarFunis() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funis`)
      const data = await response.json()
      setFunnels(data)
    } catch (error) {
      console.error('Erro ao carregar funis', error)
    } finally {
      setLoading(false)
    }
  }

  async function deletarFunil(id: string) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este funil?\n\nTodas as instâncias vinculadas a este funil também serão excluídas.\n\nEsta ação não pode ser desfeita."
    )
    if (!confirmar) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funis/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir funil")
      setFunnels((funis) => funis.filter((funil) => funil.id !== id))
      
      if (activeFunilId === id) {
        fecharEditor()
      }
    } catch (error) {
      console.error(error)
      alert("Não foi possível excluir o funil.")
    }
  }

  // ==== CONTROLES DO EDITOR ====
  function abrirCriacao() {
    setEditorMode("new")
    setActiveFunilId(null)
    setActiveView("editor")
  }

  function abrirEditor(id: string, flow: "cadastro" | "chatbot") {
    setActiveFunilId(id)
    setInitialFlowType(flow)
    setEditorMode("flow")
    setActiveView("editor")
  }

  function fecharEditor() {
    setActiveView("list")
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    const id_funil = crypto.randomUUID()

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_funil, name: newName, description: newDesc }),
      })

      if (!response.ok) throw new Error("Erro ao criar o funil")
      const data = await response.json()

      setFunnels((prev) => [...prev, { id: data.id_funil, name: newName, description: newDesc }])

      setNewName("")
      setNewDesc("")
      setActiveFunilId(data.id_funil)
      setInitialFlowType("cadastro")
      setEditorMode("flow")
    } catch (error) {
      console.error("Erro ao criar funil:", error)
      alert("Ocorreu um erro ao criar o funil. Tente novamente.")
    } finally {
      setCreating(false)
    }
  }

  // ==== MODAL DE EDIÇÃO BÁSICA ====
  function openEditModal(funil: Funil) {
    setEditingFunil(funil)
    setEditName(funil.name)
    setEditDescription(funil.description)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingFunil) return
    setSavingAction(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funis/${editingFunil.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar o funil")

      setFunnels((prevFunnels) =>
        prevFunnels.map((f) =>
          f.id === editingFunil.id
            ? { ...f, name: editName, description: editDescription }
            : f
        )
      )
      setEditingFunil(null)
    } catch (error) {
      console.error("Erro ao atualizar funil:", error)
      alert("Ocorreu um erro ao atualizar o funil. Tente novamente.")
    } finally {
      setSavingAction(false)
    }
  }

  // ==== RENDERIZAÇÃO DAS TELAS ====
  const listContent = (
    <div className="p-6 space-y-6 relative h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-700">Funis</h1>
        <div className="flex gap-3">
          <button
            onClick={abrirCriacao}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg">+</span>
            Criar novo funil
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-sm text-zinc-500">Carregando funis...</p>}
        {!loading && funnels.length === 0 && (
          <p className="text-zinc-500 text-sm">Nenhum funil cadastrado.</p>
        )}

        {funnels.map((funil) => (
          <div key={funil.id} className="bg-white rounded shadow p-5 space-y-2 border border-zinc-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-700">{funil.name}</h2>
                <p className="text-sm text-zinc-500">{funil.description}</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center gap-4">
                  <button
                    onClick={() => openEditModal(funil)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletarFunil(funil.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
                  >
                    Deletar
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => abrirEditor(funil.id, "cadastro")}
                    className="flex-1 text-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
                  >
                    Cadastro
                  </button>
                  <button
                    onClick={() => abrirEditor(funil.id, "chatbot")}
                    className="flex-1 text-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 shadow-sm"
                  >
                    Chatbot
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const editorContent = (
    <div className="h-full bg-zinc-50">
      {editorMode === null && (
        <div className="flex h-full items-center justify-center text-zinc-400">
          Selecione um funil na lista ou crie um novo para iniciar o editor.
        </div>
      )}

      {editorMode === "new" && (
        <div className="p-6 max-w-lg mx-auto space-y-6 pt-12">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-700">Criar Novo Funil</h1>
            <button onClick={fecharEditor} className="text-sm text-zinc-500 hover:underline">
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="bg-white rounded shadow border border-zinc-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Funil</label>
              <input
                type="text"
                required
                placeholder="Ex: Funil de Vendas - Black Friday"
                className="w-full border border-zinc-300 rounded px-3 py-2 outline-none focus:border-blue-500 text-zinc-700"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                placeholder="Breve descrição do objetivo deste funil..."
                className="w-full border border-zinc-300 rounded px-3 py-2 outline-none focus:border-blue-500 min-h-[100px] text-zinc-700"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {creating ? "Criando..." : "Criar e editar fluxo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editorMode === "flow" && activeFunilId && (
        <FunnelFlowBuilder
          key={activeFunilId}
          idFunil={activeFunilId}
          initialFlow={initialFlowType}
          onClose={fecharEditor}
        />
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col relative bg-zinc-50">
      {/* Container da Lista */}
      <div className={activeView === "list" ? "block h-full" : "hidden"}>
        {listContent}
      </div>

      {/* Container do Editor */}
      <div className={activeView === "editor" ? "block h-full" : "hidden"}>
        {editorContent}
      </div>
      
      {/* Modais Globais da Página */}
      <MensagemPredefinidaModal open={showMensagemModal} onClose={() => setShowMensagemModal(false)} />
      
      {editingFunil && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-zinc-800 mb-4">Editar Funil</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  className="w-full border border-zinc-300 rounded px-3 py-2 outline-none focus:border-blue-500 text-zinc-700"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
                <textarea
                  className="w-full border border-zinc-300 rounded px-3 py-2 outline-none focus:border-blue-500 min-h-[100px] text-zinc-700"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingFunil(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingAction ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}