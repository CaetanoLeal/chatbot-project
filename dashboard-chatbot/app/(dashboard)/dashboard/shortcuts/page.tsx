// app/(dashboards)/dashboard/shortcuts/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, MessageSquareOff, MessageSquareText } from 'lucide-react'

// 1. Atualizado com os nomes corretos da tabela tbl_atalho_tipo
type TipoMensagem = {
  sg_atalho_tipo: string
  ds_atalho_tipo: string
}

// 2. Atualizado com a coluna correspondente na tbl_atalho
type MensagemPredefinida = {
  id_atalho: string
  no_atalho: string
  ds_atalho: string
  sg_atalho_tipo: tipo
}

type tipo = 'G' | 'B' | 'E' | 'T' | 'F'

/* =====================
   TIPO MAPS
===================== */
const TIPO_LABEL: Record<tipo, string> = {
  G: "Geral",
  B: "Boas-vindas",
  E: "Encerramento",
  T: "Transferência",
  F: "Fechado",
}

export default function SavedMessagesPage() {
  const [mensagens, setMensagens] = useState<MensagemPredefinida[]>([])
  const [tipos, setTipos] = useState<TipoMensagem[]>([])
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [tipoId, setTipoId] = useState('')
  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    carregarMensagens()
    carregarTipos()
  }, [])

  async function carregarTipos() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mensagens-predefinidas/tipos`
      )
      const json = await response.json()
      if (json.success) {
        console.log("DADOS DOS TIPOS:", json.data) // <--- OLHE O CONSOLE DO NAVEGADOR
        setTipos(json.data)
      }
    } catch (err) {
      console.error('Erro ao carregar os tipos:', err)
    }
  }

  async function carregarMensagens() {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mensagens-predefinidas`
      )
      const json = await response.json()
      if (json.success) {
        setMensagens(json.data)
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar mensagens.')
    } finally {
      setLoading(false)
    }
  }

  function limparFormulario() {
    setEditingId(null)
    setTipoId('')
    setNome('')
    setMensagem('')
  }

  async function salvarMensagem(e: React.FormEvent) {
    e.preventDefault()

    if (!tipoId) {
      alert('Selecione o tipo da mensagem.')
      return
    }

    if (!nome.trim()) {
      alert('Informe o nome.')
      return
    }

    if (!mensagem.trim()) {
      alert('Informe a mensagem.')
      return
    }

    setSaving(true)
    try {
      const body = {
        sg_atalho_tipo: tipoId, // Atualizado para enviar a sigla correta para sua API
        no_mensagem_predefinida: nome,
        ds_mensagem_predefinida: mensagem,
      }

      const response = await fetch(
        editingId
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/mensagens-predefinidas/${editingId}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/mensagens-predefinidas`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message)
      }

      limparFormulario()
      await carregarMensagens()
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  function editarMensagem(mensagemSelecionada: MensagemPredefinida) {
    setEditingId(mensagemSelecionada.id_atalho)
    setTipoId(mensagemSelecionada.sg_atalho_tipo || '') // Usa a sigla ao editar
    setNome(mensagemSelecionada.no_atalho)
    setMensagem(mensagemSelecionada.ds_atalho)
  }

  async function excluirMensagem(id: string) {
    const confirmar = confirm('Deseja excluir esta mensagem?')
    if (!confirmar) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mensagens-predefinidas/${id}`,
        {
          method: 'DELETE',
        }
      )

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message)
      }

      setMensagens((old) => old.filter((m) => m.id_atalho !== id))

      if (editingId === id) {
        limparFormulario()
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Mensagens Predefinidas</h1>
          <p className="text-sm text-zinc-500">Atalhos de texto usados no atendimento</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[380px]">
          <div className="sticky top-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-5">
              <h2 className="text-base font-semibold text-zinc-800">
                {editingId ? 'Editar mensagem' : 'Nova mensagem'}
              </h2>
            </div>

            <form onSubmit={salvarMensagem} className="flex flex-col gap-5 p-6">
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Nome da Mensagem
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex.: Boas-vindas"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Tipo da Mensagem
                </label>
                <select
                  value={tipoId}
                  onChange={(e) => setTipoId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="" disabled>Selecione um tipo...</option>
                  
                  {tipos.map((tipo, index) => (
                    <option 
                      key={`${tipo.sg_atalho_tipo}-${index}`} 
                      value={tipo.sg_atalho_tipo}
                    >
                      {tipo.ds_atalho_tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Conteúdo
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="min-h-[160px] w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Digite a mensagem..."
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                {editingId && (
                  <button
                    type="button"
                    onClick={limparFormulario}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto"
                  >
                    Cancelar
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-70 sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {editingId ? 'Atualizar' : 'Cadastrar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
            <h2 className="text-base font-semibold text-zinc-800">Mensagens Cadastradas</h2>
            {!loading && mensagens.length > 0 && (
              <span className="text-sm text-zinc-400">{mensagens.length} no total</span>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {loading && (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {!loading && mensagens.length === 0 && (
              <div className="flex h-64 flex-col items-center justify-center space-y-3 text-zinc-500">
                <div className="rounded-full bg-zinc-50 p-4">
                  <MessageSquareOff className="h-8 w-8 text-zinc-400" />
                </div>
                <p>Nenhuma mensagem cadastrada.</p>
              </div>
            )}

            {!loading && mensagens.length > 0 && (
              <div className="grid gap-3">
                {mensagens.map((msg) => (
                  <div
                    key={msg.id_atalho}
                    className="group flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-start"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-800">{msg.no_atalho}</h3>
                        
                        {/* Mostra a sigla do tipo na listagem (G, B, E...) */}
                        {msg.sg_atalho_tipo && (
                          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                            {TIPO_LABEL[msg.sg_atalho_tipo] ?? msg.sg_atalho_tipo}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-zinc-600 line-clamp-3">
                        {msg.ds_atalho}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        onClick={() => editarMensagem(msg)}
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => excluirMensagem(msg.id_atalho)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}