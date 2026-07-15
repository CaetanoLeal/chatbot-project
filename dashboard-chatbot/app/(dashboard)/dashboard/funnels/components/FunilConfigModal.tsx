//app/(dashboard)/dashboard/funnels/components/FunilConfigModal.tsx
"use client"

import { useEffect, useState } from "react"
import * as api from "../lib/api"
import type { Campo, CampoTipo, Setor } from "../lib/api"

// Tipos de propriedades para o componente FunilConfigModal
type Props = {
  idFunil: string
  initialTab: "campos" | "setores"
  onClose: () => void
  onCamposChange: (campos: Campo[]) => void
  onSetoresChange: (setores: Setor[]) => void
}

// Componente para exibir o modal de configuração do funil
export default function FunilConfigModal({ idFunil, initialTab, onClose, onCamposChange, onSetoresChange }: Props) {
  // Estado para controlar a aba ativa (campos ou setores)
  const [tab, setTab] = useState<"campos" | "setores">(initialTab)

  // Estados para armazenar os dados de campos, tipos de campos e setores
  const [campos, setCampos] = useState<Campo[]>([])
  const [tipos, setTipos] = useState<CampoTipo[]>([])
  const [setores, setSetores] = useState<Setor[]>([])

  // Estados para controlar os valores dos novos campos e setores a serem criados
  const [novoCampoNome, setNovoCampoNome] = useState("")
  const [novoCampoLabel, setNovoCampoLabel] = useState("")
  const [novoCampoTipo, setNovoCampoTipo] = useState<number | "">("")
  const [novoCampoObrigatorio, setNovoCampoObrigatorio] = useState(true)

  // Estado para controlar o status de salvamento e mensagens de erro
  const [novoSetorNome, setNovoSetorNome] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Efeito para carregar os dados iniciais de campos, tipos de campos e setores ao montar o componente
  useEffect(() => {
    ;(async () => {
      try {
        const [c, t, s] = await Promise.all([
          api.listarCampos(),
          api.listarTiposCampo(),
          api.listarSetores(),
        ])
        setCampos(c)
        setTipos(t)
        setSetores(s)
        if (t.length > 0) setNovoCampoTipo(t[0].cd_campo_tipo)
      } catch (err: any) {
        setError(err.message)
      }
    })()
  }, [idFunil])

  // Função para criar um novo campo personalizado
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
      // Atualiza a lista de campos após a criação
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

  // Função para remover um campo personalizado
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

  // Função para criar um novo setor
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

  // Função para remover um setor
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

  // Renderização do modal de configuração do funil
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto text-zinc-700">
        <div className="flex border-b border-zinc-100">
          <button
            className={`flex-1 py-3 text-sm font-medium ${tab === "campos" ? "text-blue-600 border-b-2 border-blue-600" : "text-zinc-400"}`}
            onClick={() => setTab("campos")}
          >
            Campos personalizados
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${tab === "setores" ? "text-blue-600 border-b-2 border-blue-600" : "text-zinc-400"}`}
            onClick={() => setTab("setores")}
          >
            Setores
          </button>
          <button onClick={onClose} className="px-4 text-zinc-400 hover:text-zinc-600">
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
      </div>
    </div>
  )
}