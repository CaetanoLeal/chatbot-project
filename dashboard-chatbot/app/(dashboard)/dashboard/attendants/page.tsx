"use client"

import { useEffect, useState } from "react"
import AtendenteModal from "./components/AtendenteModal"
import { Bot, User } from "lucide-react"

type Setor = {
  id_setor: string
  no_setor: string
}

type Atendente = {
  id_atendente: string
  no_atendente: string
  is_ia: boolean
  im_image?: string | null
  setores: Setor[]
}

export default function AtendentesPage() {
  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [atendenteToEdit, setAtendenteToEdit] = useState<Atendente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAtendentes = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/atendentes`
      )

      if (!response.ok) {
        throw new Error("Erro ao buscar atendentes")
      }

      const data = await response.json()
      setAtendentes(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAtendentes()
  }, [])

  const handleOpenCreateModal = () => {
    setAtendenteToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (atendente: Atendente) => {
    setAtendenteToEdit(atendente)
    setIsModalOpen(true)
  }

  const handleDelete = async (id_atendente: string) => {
    const confirmacao = window.confirm(
      "Tem certeza que deseja excluir este atendente?"
    )

    if (!confirmacao) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/atendentes/${id_atendente}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Erro ao excluir atendente.")
      }

      setAtendentes((prev) =>
        prev.filter((a) => a.id_atendente !== id_atendente)
      )
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    }
  }

  return (
    <div className="p-6 space-y-6 text-zinc-700">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-800">
          Atendentes
        </h1>

        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          + Cadastrar Atendente
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded shadow p-6 text-zinc-500">
          Carregando atendentes...
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-600 rounded p-4">
          {error}
        </div>
      )}

      {!loading && !error && atendentes.length === 0 && (
        <div className="bg-white rounded shadow p-6 text-zinc-500">
          Nenhum atendente cadastrado.
        </div>
      )}

      {!loading && !error && atendentes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {atendentes.map((atendente) => (
            <div
              key={atendente.id_atendente}
              className="bg-white rounded shadow p-4 flex gap-4 items-center justify-between"
            >
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center shrink-0 shadow-inner">
                  {atendente.im_image ? (
                    <img
                      src={atendente.im_image}
                      alt={atendente.no_atendente}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-zinc-500 text-lg font-bold">
                      {atendente.no_atendente.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-zinc-800">
                    {atendente.no_atendente}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {atendente.setores.length > 0 ? (
                      atendente.setores.map((setor) => (
                        <span
                          key={setor.id_setor}
                          className="bg-zinc-100 text-zinc-700 text-xs px-2 py-1 rounded border border-zinc-200"
                        >
                          {setor.no_setor}
                        </span>
                      ))
                    ) : (
                      <span className="bg-zinc-100 text-zinc-700 text-xs px-2 py-1 rounded border border-zinc-200">
                        Sem setor
                      </span>
                    )}

                    {atendente.is_ia ? (
                      <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200">
                        <Bot className="w-3.5 h-3.5" />
                        IA
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded border border-green-200">
                        <User className="w-3.5 h-3.5" />
                        Humano
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(atendente)}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded transition text-sm font-medium"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(atendente.id_atendente)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded transition text-sm font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AtendenteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAtendentes}
        atendenteToEdit={atendenteToEdit}
      />
    </div>
  )
}