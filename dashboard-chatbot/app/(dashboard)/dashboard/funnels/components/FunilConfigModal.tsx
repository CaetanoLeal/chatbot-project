//app/(dashboard)/dashboard/funnels/components/FunilConfigModal.tsx
"use client"

import { useEffect, useState } from "react"
import * as api from "../lib/api"
import type { Campo, CampoTipo, Setor, Expiracao } from "../lib/api"

type Props = {
  idFunil: string
  initialTab: "campos" | "setores" | "expiracao"
  onClose: () => void
  onCamposChange: (campos: Campo[]) => void
  onSetoresChange: (setores: Setor[]) => void
  onExpiracoesChange?: (expiracoes: Expiracao[]) => void
}

export default function FunilConfigModal({
  idFunil,
  initialTab,
  onClose,
  onCamposChange,
  onSetoresChange,
  onExpiracoesChange,
}: Props) {
  const [tab, setTab] = useState<"campos" | "setores" | "expiracao">(initialTab)

  const [campos, setCampos] = useState<Campo[]>([])
  const [tipos, setTipos] = useState<CampoTipo[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [expiracoes, setExpiracoes] = useState<Expiracao[]>([])

  const [novoCampoNome, setNovoCampoNome] = useState("")
  const [novoCampoLabel, setNovoCampoLabel] = useState("")
  const [novoCampoTipo, setNovoCampoTipo] = useState<number | "">("")
  const [novoCampoObrigatorio, setNovoCampoObrigatorio] = useState(true)

  const [novoSetorNome, setNovoSetorNome] = useState("")

  // form de expiração (serve tanto para criar quanto para editar)
  const [expEditandoId, setExpEditandoId] = useState<string | null>(null)
  const [expMensagem, setExpMensagem] = useState("")
  const [expSequencia, setExpSequencia] = useState<number>(1)
  const [expMinutos, setExpMinutos] = useState<number>(1)
  const [expFinaliza, setExpFinaliza] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [c, t, s, e] = await Promise.all([
          api.listarCampos(),
          api.listarTiposCampo(),
          api.listarSetores(),
          api.listarExpiracoes(idFunil),
        ])
        setCampos(c)
        setTipos(t)
        setSetores(s)
        setExpiracoes(e)
        if (t.length > 0) setNovoCampoTipo(t[0].cd_campo_tipo)
        setExpSequencia(proximaSequencia(e))
      } catch (err: any) {
        setError(err.message)
      }
    })()
  }, [idFunil])

  function proximaSequencia(lista: Expiracao[]) {
    return lista.length === 0 ? 1 : Math.max(...lista.map((x) => x.nu_sequencia)) + 1
  }

  async function criarCampo() {
    if (!novoCampoNome.trim() || novoCampoTipo === "") return
    try {
      setSaving(true)
      await api.criarCampo(idFunil, {
        no_campo: novoCampoNome.trim(),
        ds_label: novoCampoLabel.trim() || undefined,
        cd_campo_tipo: Number(novoCampoTipo),
        is_obrigatorio: novoCampoObrigatorio,
      })
      const atualizados = await api.listarCampos()
      setCampos(atualizados)
      onCamposChange(atualizados)
      setNovoCampoNome("")
      setNovoCampoLabel("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removerCampo(id_campo: string) {
    try {
      await api.removerCampo(idFunil, id_campo)
      const atualizados = await api.listarCampos()
      setCampos(atualizados)
      onCamposChange(atualizados)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function criarSetor() {
    if (!novoSetorNome.trim()) return
    try {
      setSaving(true)
      await api.criarSetor({ no_setor: novoSetorNome.trim() })
      const atualizados = await api.listarSetores()
      setSetores(atualizados)
      onSetoresChange(atualizados)
      setNovoSetorNome("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removerSetor(id_setor: string) {
    try {
      await api.removerSetor(idFunil, id_setor)
      const atualizados = await api.listarSetores()
      setSetores(atualizados)
      onSetoresChange(atualizados)
    } catch (err: any) {
      setError(err.message)
    }
  }

  function limparFormExpiracao(listaAtual: Expiracao[]) {
    setExpEditandoId(null)
    setExpMensagem("")
    setExpMinutos(1)
    setExpFinaliza(false)
    setExpSequencia(proximaSequencia(listaAtual))
  }

  function editarExpiracao(exp: Expiracao) {
    setExpEditandoId(exp.id_funil_expiracao)
    setExpMensagem(exp.gn_mensagem)
    setExpSequencia(exp.nu_sequencia)
    setExpMinutos(exp.qt_minutos)
    setExpFinaliza(exp.qt_minutos === 0)
  }

  async function salvarExpiracao() {
    if (!expMensagem.trim()) return
    const payload = {
      gn_mensagem: expMensagem.trim(),
      nu_sequencia: expSequencia,
      qt_minutos: expFinaliza ? 0 : expMinutos,
    }
    try {
      setSaving(true)
      if (expEditandoId) {
        await api.atualizarExpiracao(idFunil, expEditandoId, payload)
      } else {
        await api.criarExpiracao(idFunil, payload)
      }
      const atualizados = await api.listarExpiracoes(idFunil)
      setExpiracoes(atualizados)
      onExpiracoesChange?.(atualizados)
      limparFormExpiracao(atualizados)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removerExpiracao(id: string) {
    try {
      await api.removerExpiracao(idFunil, id)
      const atualizados = await api.listarExpiracoes(idFunil)
      setExpiracoes(atualizados)
      onExpiracoesChange?.(atualizados)
      if (expEditandoId === id) limparFormExpiracao(atualizados)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto text-zinc-700">
        <div className="flex overflow-x-auto border-b border-zinc-100 no-scrollbar">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${tab === "campos" ? "text-blue-600 border-b-2 border-blue-600" : "text-zinc-400"}`}
            onClick={() => setTab("campos")}
          >
            Campos personalizados
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${tab === "setores" ? "text-blue-600 border-b-2 border-blue-600" : "text-zinc-400"}`}
            onClick={() => setTab("setores")}
          >
            Setores
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${tab === "expiracao" ? "text-blue-600 border-b-2 border-blue-600" : "text-zinc-400"}`}
            onClick={() => setTab("expiracao")}
          >
            Expiração
          </button>
          <button onClick={onClose} className="px-4 text-zinc-400 hover:text-zinc-600 shrink-0">
            ✕
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-5 py-2">{error}</div>}

        {tab === "campos" && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-zinc-400">
              Cada campo criado aqui fica disponível nas mensagens do tipo "Aguardar resposta" para salvar o dado
              coletado, e pode ser usado em qualquer texto com <code>{"{nome_do_campo}"}</code>.
            </p>

            <div className="space-y-2 border border-zinc-100 rounded p-3">
              <input
                className="border rounded px-2 py-1.5 w-full text-sm"
                placeholder="Nome interno (ex: no_utilizador)"
                value={novoCampoNome}
                onChange={(e) => setNovoCampoNome(e.target.value)}
              />
              <input
                className="border rounded px-2 py-1.5 w-full text-sm"
                placeholder="Rótulo (ex: Nome completo) — opcional"
                value={novoCampoLabel}
                onChange={(e) => setNovoCampoLabel(e.target.value)}
              />
              <div className="flex gap-2">
                <select
                  className="border rounded px-2 py-1.5 flex-1 text-sm"
                  value={novoCampoTipo}
                  onChange={(e) => setNovoCampoTipo(Number(e.target.value))}
                >
                  {tipos.map((t) => (
                    <option key={t.cd_campo_tipo} value={t.cd_campo_tipo}>
                      {t.ds_campo_tipo}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={novoCampoObrigatorio}
                    onChange={(e) => setNovoCampoObrigatorio(e.target.checked)}
                  />
                  obrigatório
                </label>
              </div>
              <button
                onClick={criarCampo}
                disabled={saving}
                className="bg-zinc-800 text-white text-sm px-3 py-1.5 rounded w-full disabled:opacity-50"
              >
                + adicionar campo
              </button>
            </div>

            <div className="space-y-1">
              {campos.map((c) => (
                <div key={c.id_campo} className="flex items-center justify-between text-sm bg-zinc-50 px-3 py-2 rounded">
                  <span>
                    {c.ds_label || c.no_campo}{" "}
                    <span className="text-zinc-400 text-xs">
                      ({c.no_campo} · {c.ds_campo_tipo}
                      {c.is_obrigatorio ? " · obrigatório" : ""})
                    </span>
                  </span>
                  <button onClick={() => removerCampo(c.id_campo)} className="text-red-500 text-xs">
                    remover
                  </button>
                </div>
              ))}
              {campos.length === 0 && <p className="text-xs text-zinc-400">Nenhum campo criado ainda.</p>}
            </div>
          </div>
        )}

        {tab === "setores" && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-zinc-400">
              Setores identificam para onde uma conversa vai quando finaliza com status "Atendente" ou "Pendente".
            </p>

            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1.5 flex-1 text-sm"
                placeholder="Nome do setor (ex: Suporte, Vendas)"
                value={novoSetorNome}
                onChange={(e) => setNovoSetorNome(e.target.value)}
              />
              <button
                onClick={criarSetor}
                disabled={saving}
                className="bg-zinc-800 text-white text-sm px-3 py-1.5 rounded disabled:opacity-50"
              >
                + adicionar
              </button>
            </div>

            <div className="space-y-1">
              {setores.map((s) => (
                <div key={s.id_setor} className="flex items-center justify-between text-sm bg-zinc-50 px-3 py-2 rounded">
                  <span>{s.no_setor}</span>
                  <button onClick={() => removerSetor(s.id_setor)} className="text-red-500 text-xs">
                    remover
                  </button>
                </div>
              ))}
              {setores.length === 0 && <p className="text-xs text-zinc-400">Nenhum setor criado ainda.</p>}
            </div>
          </div>
        )}

        {tab === "expiracao" && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-zinc-400">
              Mensagens enviadas em sequência quando o usuário fica inativo. A ordem segue a "sequência", e cada uma
              usa os "minutos" para saber quando disparar a próxima. Quando os minutos forem <strong>0</strong>, essa
              mensagem encerra o atendimento.
            </p>

            <div className="space-y-2 border border-zinc-100 rounded p-3">
              <textarea
                className="border rounded px-2 py-1.5 w-full text-sm min-h-[70px]"
                placeholder="Texto da mensagem de expiração"
                value={expMensagem}
                onChange={(e) => setExpMensagem(e.target.value)}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Sequência</label>
                  <input
                    type="number"
                    min={1}
                    className="border rounded px-2 py-1.5 w-full text-sm"
                    value={expSequencia}
                    onChange={(e) => setExpSequencia(Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Minutos até a próxima</label>
                  <input
                    type="number"
                    min={0}
                    disabled={expFinaliza}
                    className="border rounded px-2 py-1.5 w-full text-sm disabled:bg-zinc-100"
                    value={expFinaliza ? 0 : expMinutos}
                    onChange={(e) => setExpMinutos(Number(e.target.value))}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={expFinaliza}
                  onChange={(e) => setExpFinaliza(e.target.checked)}
                />
                Esta mensagem encerra o atendimento (minutos = 0)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={salvarExpiracao}
                  disabled={saving}
                  className="bg-zinc-800 text-white text-sm px-3 py-1.5 rounded flex-1 disabled:opacity-50"
                >
                  {expEditandoId ? "salvar alteração" : "+ adicionar mensagem"}
                </button>
                {expEditandoId && (
                  <button
                    onClick={() => limparFormExpiracao(expiracoes)}
                    className="text-zinc-500 text-sm px-3 py-1.5 rounded border"
                  >
                    cancelar
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {[...expiracoes]
                .sort((a, b) => a.nu_sequencia - b.nu_sequencia)
                .map((e) => (
                  <div key={e.id_funil_expiracao} className="flex items-center justify-between text-sm bg-zinc-50 px-3 py-2 rounded gap-2">
                    <div className="min-w-0">
                      <span className="text-zinc-400 text-xs">
                        #{e.nu_sequencia} · {e.qt_minutos === 0 ? "encerra atendimento" : `${e.qt_minutos} min`}
                      </span>
                      <p className="truncate">{e.gn_mensagem}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => editarExpiracao(e)} className="text-blue-600 text-xs">
                        editar
                      </button>
                      <button onClick={() => removerExpiracao(e.id_funil_expiracao)} className="text-red-500 text-xs">
                        remover
                      </button>
                    </div>
                  </div>
                ))}
              {expiracoes.length === 0 && <p className="text-xs text-zinc-400">Nenhuma mensagem de expiração criada ainda.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}