"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BrainCircuit, Loader2, ArrowLeft } from "lucide-react"

export interface ModeloIA {
  id_funil_ia_modelo: number
  ds_funil_ia_modelo: string
}

export interface Setor {
  id_setor: string
  no_setor: string
}

export interface FunilIA {
  id_funil_ia?: string
  no_funil?: string
  no_agente: string
  ds_funil: string
  ds_personalidade: string
  nu_temperature: number
  nu_max_tokens: number
  is_ativo: boolean
  ds_fallback: string
  is_human_handoff: boolean
  id_funil_ia_modelo: number
  id_setor: string
}

interface IAFunilFormProps {
  initialData: FunilIA
  modelos: ModeloIA[]
  onSubmit: (data: FunilIA) => void
  saving: boolean
  title: string
  subtitle: string
  error?: string | null
}

export default function IAFunilForm({
  initialData,
  modelos,
  onSubmit,
  saving,
  title,
  subtitle,
  error,
}: IAFunilFormProps) {
  const [form, setForm] = useState<FunilIA>(initialData)
  const [setores, setSetores] = useState<Setor[]>([])
  const [loadingSetores, setLoadingSetores] = useState<boolean>(true)

  // Atualiza o formulário se os dados iniciais mudarem (útil para o fetch assíncrono do Edit)
  useEffect(() => {
    setForm(initialData)
  }, [initialData])

  // Busca os setores de forma dinâmica na API
  useEffect(() => {
    async function fetchSetores() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/setores`)
        if (response.ok) {
          const data = await response.json()
          setSetores(data)
        }
      } catch (error) {
        console.error("Erro ao buscar setores:", error)
      } finally {
        setLoadingSetores(false)
      }
    }

    fetchSetores()
  }, [])

  return (
    <div className="p-6 bg-zinc-100 h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/dashboard/aipannel/aifunnels"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-zinc-800 flex items-center gap-2">
            {title}
            <BrainCircuit className="w-8 h-8 text-blue-600" />
          </h1>
          <p className="text-zinc-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* NOME DO AGENTE */}
          <div>
            <label className="block text-sm font-medium mb-2">Nome do agente</label>
            <input
              value={form.no_agente || ""}
              onChange={(e) => setForm({ ...form, no_agente: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Atendente Financeiro"
            />
          </div>

          {/* MODELO IA */}
          <div>
            <label className="block text-sm font-medium mb-2">Modelo IA</label>
            <select
              value={form.id_funil_ia_modelo}
              onChange={(e) => setForm({ ...form, id_funil_ia_modelo: Number(e.target.value) })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {modelos.map((modelo) => (
                <option key={modelo.id_funil_ia_modelo} value={modelo.id_funil_ia_modelo}>
                  {modelo.ds_funil_ia_modelo}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIÇÃO DO FUNIL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Descrição do funil</label>
            <input
              value={form.ds_funil || ""}
              onChange={(e) => setForm({ ...form, ds_funil: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o objetivo deste agente"
            />
          </div>

          {/* PERSONALIDADE DA IA */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Personalidade da IA</label>
            <textarea
              rows={8}
              value={form.ds_personalidade || ""}
              onChange={(e) => setForm({ ...form, ds_personalidade: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* TEMPERATURE */}
          <div>
            <label className="block text-sm font-medium mb-2">Temperature</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={form.nu_temperature}
              onChange={(e) => setForm({ ...form, nu_temperature: Number(e.target.value) })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* MAX TOKENS */}
          <div>
            <label className="block text-sm font-medium mb-2">Max Tokens</label>
            <input
              type="number"
              min={50}
              max={500}
              value={form.nu_max_tokens}
              onChange={(e) => setForm({ ...form, nu_max_tokens: Number(e.target.value) })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* FALLBACK */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Mensagem fallback</label>
            <textarea
              rows={3}
              value={form.ds_fallback || ""}
              onChange={(e) => setForm({ ...form, ds_fallback: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* ESCOLHER SETOR */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Escolher Setor</label>
            <select
              value={form.id_setor || ""}
              onChange={(e) => setForm({ ...form, id_setor: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={loadingSetores}
            >
              {setores.map((setor) => (
                <option key={setor.id_setor} value={setor.id_setor}>
                  {setor.no_setor}
                </option>
              ))}
            </select>
          </div>

          {/* HANDOFF HUMANO */}
          <div className="md:col-span-2 flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
            <div>
              <h3 className="font-semibold text-zinc-800">Handoff humano</h3>
              <p className="text-sm text-zinc-500">Transfere atendimento para humano.</p>
            </div>
            <input
              type="checkbox"
              checked={form.is_human_handoff}
              onChange={(e) => setForm({ ...form, is_human_handoff: e.target.checked })}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl mt-4">
            {error}
          </div>
        )}

        {/* BOTÕES */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <Link
            href="/dashboard/aipannel/aifunnels"
            className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition text-zinc-700 font-medium"
          >
            Cancelar
          </Link>
          <button
            onClick={() => onSubmit(form)}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {saving && <Loader2 className="animate-spin w-4 h-4" />}
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}