//app/(dashboard)/dashboard/funnels/page.tsx
'use client'

import { useEffect, useState } from 'react'

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
        const response = await fetch('http://45.228.143.12:3001/api/funis')
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

              <div className="flex gap-2">
                <a
                  href={`/dashboard/funnels/${funil.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Editar
                </a>
                <button className="text-red-600 text-sm hover:underline">
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}