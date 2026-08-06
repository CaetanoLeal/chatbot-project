// app/(dashboard)/dashboard/funnels/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Zap } from "lucide-react"
import MensagemPredefinidaModal from "./components/MensagemPredefinidaModal"

type Funil = {
  id: string
  name: string
  description: string
}

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<Funil[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para o Modal de Edição
  const [editingFunil, setEditingFunil] = useState<Funil | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingAction, setSavingAction] = useState(false)
  const [showMensagemModal, setShowMensagemModal] = useState(false)

  useEffect(() => {
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
    carregarFunis()
  }, [])

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
    } catch (error) {
      console.error(error)
      alert("Não foi possível excluir o funil.")
    }
  }

  // Função para abrir o modal com os dados do funil
  function openEditModal(funil: Funil) {
    setEditingFunil(funil)
    setEditName(funil.name)
    setEditDescription(funil.description)
  }

  // Função para salvar a edição
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

      // Atualiza o funil na lista local sem precisar recarregar a página
      setFunnels((prevFunnels) =>
        prevFunnels.map((f) =>
          f.id === editingFunil.id
            ? { ...f, name: editName, description: editDescription }
            : f
        )
      )
      
      // Fecha o modal
      setEditingFunil(null)
    } catch (error) {
      console.error("Erro ao atualizar funil:", error)
      alert("Ocorreu um erro ao atualizar o funil. Tente novamente.")
    } finally {
      setSavingAction(false)
    }
  }

  if (loading) {
    return <div className="p-6">Carregando funis...</div>
  }

  return (
    <div className="p-6 space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-700">
          Funis
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowMensagemModal(true)}
            className="h-full aspect-square flex items-center justify-center border border-zinc-300 rounded-lg bg-black hover:bg-zinc-700 text-white transition-colors px-3"
          >
            <Zap className="h-4 w-4" />
          </button>

          <a
            href="/dashboard/funnels/new"
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <span className="text-lg">+</span>
            Criar novo funil
          </a>
        </div>
      </div>

      {/* Lista de funis */}
      <div className="space-y-4">
        {funnels.length === 0 && (
          <p className="text-zinc-500 text-sm">Nenhum funil cadastrado.</p>
        )}

        {funnels.map((funil) => (
          <div key={funil.id} className="bg-white rounded shadow p-5 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-700">{funil.name}</h2>
                <p className="text-sm text-zinc-500">{funil.description}</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center gap-4">
                  {/* Botão de Editar agora abre o Modal */}
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
                  <a
                    href={`/dashboard/funnels/${funil.id}?flow=cadastro`}
                    className="flex-1 text-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Cadastro
                  </a>
                  <a
                    href={`/dashboard/funnels/${funil.id}?flow=chatbot`}
                    className="flex-1 text-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    Chatbot
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO */}
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
      <MensagemPredefinidaModal
        open={showMensagemModal}
        onClose={() => setShowMensagemModal(false)}
      />
    </div>
  )
}