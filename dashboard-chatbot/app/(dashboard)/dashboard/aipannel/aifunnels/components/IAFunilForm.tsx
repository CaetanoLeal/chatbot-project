// app/(dashboard)/dashboard/aipannel/aifunnels/components/IAFunilForm.tsx
"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, Loader2, ArrowLeft } from "lucide-react"

export interface ModeloIA {
  id_funil_ia_modelo: number
  ds_funil_ia_modelo: string
}

export interface Setor {
  id_setor: string
  no_setor: string
}

export interface Funil {
  id: string
  name: string
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
  id_funil: string
}

const emptyFunil: FunilIA = {
  no_funil: "",
  no_agente: "",
  ds_funil: "",
  ds_personalidade: "",
  nu_temperature: 0.7,
  nu_max_tokens: 300,
  is_ativo: true,
  ds_fallback: "Desculpe, ocorreu um erro no atendimento.",
  is_human_handoff: false,
  id_funil_ia_modelo: 1,
  id_setor: "",
  id_funil: "",
}

interface Props {
  idFunilIa?: string | null // undefined/null = criação, string = edição
  onCancel: () => void      // volta pra lista (dentro da mesma aba)
  onSuccess: () => void     // salvou — volta pra lista e recarrega
}

export default function IAFunilForm({ idFunilIa, onCancel, onSuccess }: Props) {
  const isEdicao = !!idFunilIa

  const [form, setForm] = useState<FunilIA>(emptyFunil)
  const [modelos, setModelos] = useState<ModeloIA[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [funis, setFunis] = useState<Funil[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carrega listas de apoio + o registro (se for edição)
  useEffect(() => {
    let ativo = true

    async function init() {
      try {
        setLoadingData(true)

        const requests = [
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia-modelo`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/setores`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funis`),
        ]

        if (isEdicao) {
          requests.push(fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia/${idFunilIa}`))
        }

        const responses = await Promise.all(requests)
        const [resModelos, resSetores, resFunis, resFunilIa] = responses

        const dataModelos = await resModelos.json()
        const dataSetores = await resSetores.json()
        const dataFunis = await resFunis.json()

        if (!ativo) return

        setModelos(Array.isArray(dataModelos) ? dataModelos : dataModelos.data ?? [])
        setSetores(Array.isArray(dataSetores) ? dataSetores : [])
        setFunis(Array.isArray(dataFunis) ? dataFunis : [])

        if (isEdicao && resFunilIa) {
          const dataFunilIa = await resFunilIa.json()
          setForm(dataFunilIa)
        } else {
          setForm(emptyFunil)
        }
      } catch (err) {
        console.error("Erro ao carregar formulário de IA:", err)
        if (ativo) setError("Não foi possível carregar os dados necessários.")
      } finally {
        if (ativo) setLoadingData(false)
      }
    }

    init()

    return () => {
      ativo = false
    }
  }, [idFunilIa, isEdicao])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const url = isEdicao
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia/${idFunilIa}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia`
    const method = isEdicao ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Erro ao salvar agente IA.")
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-zinc-100 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-zinc-800 flex items-center gap-2">
            {isEdicao ? "Editar Funil de IA" : "Novo Funil de IA"}
            <BrainCircuit className="w-8 h-8 text-blue-600" />
          </h1>
          <p className="text-zinc-500 mt-1">
            {isEdicao
              ? "Atualize o comportamento da inteligência artificial."
              : "Crie o comportamento da inteligência artificial."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Nome do agente</label>
            <input
              value={form.no_agente || ""}
              onChange={(e) => setForm({ ...form, no_agente: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Atendente Financeiro"
              required
            />
          </div>

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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Descrição do funil</label>
            <input
              value={form.ds_funil || ""}
              onChange={(e) => setForm({ ...form, ds_funil: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o objetivo deste agente"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Personalidade da IA</label>
            <textarea
              rows={8}
              value={form.ds_personalidade || ""}
              onChange={(e) => setForm({ ...form, ds_personalidade: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Mensagem fallback</label>
            <textarea
              rows={3}
              value={form.ds_fallback || ""}
              onChange={(e) => setForm({ ...form, ds_fallback: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Escolher Funil</label>
            <select
              value={form.id_funil || ""}
              onChange={(e) => setForm({ ...form, id_funil: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecione um funil</option>
              {funis.map((funil) => (
                <option key={funil.id} value={funil.id}>
                  {funil.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Escolher Setor</label>
            <select
              value={form.id_setor || ""}
              onChange={(e) => setForm({ ...form, id_setor: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecione um setor</option>
              {setores.map((setor) => (
                <option key={setor.id_setor} value={setor.id_setor}>
                  {setor.no_setor}
                </option>
              ))}
            </select>
          </div>

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
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl mt-4">{error}</div>
        )}

        <div className="flex items-center justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition text-zinc-700 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !form.id_funil || !form.id_setor}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {saving && <Loader2 className="animate-spin w-4 h-4" />}
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}