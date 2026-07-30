"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Bot,
  Plus,
  Pencil,
  Trash2,
  BrainCircuit,
  Loader2
} from "lucide-react"

interface FunilIA {
  id_funil_ia: string
  no_agente: string
  ds_funil: string
  ds_personalidade: string
  nu_temperature: number
  nu_max_tokens: number
  is_ativo: boolean
  ds_fallback: string
  ds_human_handoff: boolean // Atualizado para o nome exato do seu banco de dados
  id_funil_ia_modelo: number
  ds_funil_ia_modelo?: string
  id_setor?: string // Adicionado conforme nova modelagem
}

export default function IAFunnelsPage() {
  const [loading, setLoading] = useState(true)
  const [funis, setFunis] = useState<FunilIA[]>([])

  async function loadFunis() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia`)
      const data = await response.json()

      if (Array.isArray(data)) {
        setFunis(data)
      } else if (data && Array.isArray(data.data)) {
        setFunis(data.data)
      } else {
        setFunis([])
      }
    } catch (err) {
      console.error(err)
      setFunis([])
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      await loadFunis()
      setLoading(false)
    }
    init()
  }, [])

  async function handleDelete(id: string) {
    const confirmed = confirm("Deseja remover este agente IA?")
    if (!confirmed) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia/${id}`, {
        method: "DELETE"
      })
      await loadFunis()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-100">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-zinc-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800 flex items-center gap-2">
            Funis para agentes de IA
          </h1>
          <p className="text-zinc-500 mt-1">
            Gerencie e crie comportamentos para inteligências artificiais.
          </p>
        </div>

        <Link
          href="/dashboard/aipannel/aifunnels/new"
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-3 rounded-xl flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Criar Agente IA
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {funis.map((funil) => (
          <div
            key={funil.id_funil_ia}
            className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    {funil.no_agente}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                    {funil.ds_funil}
                  </p>
                </div>
                <div>
                  {funil.is_ativo ? (
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-semibold tracking-wide">
                      ATIVO
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-md font-semibold tracking-wide">
                      INATIVO
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-zinc-600 bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                <div className="flex items-center justify-between">
                  <span>Modelo:</span>
                  <strong className="text-zinc-900">{funil.ds_funil_ia_modelo || 'N/A'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Temperature:</span>
                  <strong className="text-zinc-900">{funil.nu_temperature}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Max Tokens:</span>
                  <strong className="text-zinc-900">{funil.nu_max_tokens}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Handoff Humano:</span>
                  <strong className="text-zinc-900">
                    {funil.ds_human_handoff ? "Sim" : "Não"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-zinc-100">
              <Link
                href={`/dashboard/aipannel/aifunnels/${funil.id_funil_ia}`}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Link>
              <button
                onClick={() => handleDelete(funil.id_funil_ia)}
                className="bg-red-50 hover:bg-red-100 transition-colors rounded-xl p-2.5 text-red-600"
                title="Excluir Agente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {funis.length === 0 && !loading && (
          <div className="col-span-full py-10 flex flex-col items-center justify-center text-zinc-500 bg-white border border-dashed border-zinc-300 rounded-2xl">
            <Bot className="w-12 h-12 mb-3 text-zinc-300" />
            <p>Nenhum agente IA cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}