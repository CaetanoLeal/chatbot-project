//app/(dashboard)/dashboard/funnels/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, UserPlus, Bot } from "lucide-react";

type Funil = {
  id: string
  name: string
  description: string
}

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<Funil[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div className="p-6">Carregando funis...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-700">
          Funis
        </h1>

        <a
          href="/dashboard/funnels/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          Criar novo funil
        </a>
      </div>

      {/* Lista de funis */}
      <div className="space-y-4">
        {funnels.length === 0 && (
          <p className="text-zinc-500 text-sm">
            Nenhum funil cadastrado.
          </p>
        )}

        {funnels.map((funil) => (
          <div
            key={funil.id}
            className="bg-white rounded shadow p-5 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-700">
                  {funil.name}
                </h2>
                <p className="text-sm text-zinc-500">
                  {funil.description}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Ações principais */}
                <div className="flex justify-between items-center">
                  <a
                    href={`/dashboard/funnels/${funil.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                   Editar
                  </a>

                  <button className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors">
                   Deletar
                  </button>
                </div>

                {/* Tipos de fluxo */}
                <div className="flex gap-2">
                  <button className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    Cadastro
                  </button>

                  <button className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
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
}