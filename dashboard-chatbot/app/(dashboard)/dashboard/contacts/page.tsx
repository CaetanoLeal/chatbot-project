//app/(dashboard)/dashboard/contacts/page.tsx
"use client"

import { useState, useEffect, Fragment } from "react"
import { useTabs } from "../context/tabs-context"
import { History } from "lucide-react"

/* =====================
   TYPES
===================== */
type Platform = "whatsapp" | "telegram"

type CampoPersonalizado = {
  no_campo: string
  vl_campo: string
}

type FunilContato = {
  nome: string
  idFunil: string
  ultimoContato: string
  status: string
  campos: CampoPersonalizado[]
}

type Contact = {
  id: string
  nome: string
  telefone: string
  plataformas: Platform[]
  idChatHistorico: string | null
  funis: FunilContato[]
}

/* =====================
   HELPERS
===================== */
function PlatformTag({ platform }: { platform: Platform }) {
  return platform === "whatsapp" ? (
    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
      WhatsApp
    </span>
  ) : (
    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
      Telegram
    </span>
  )
}

function formatDate(dateString?: string) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("pt-BR")
}

/* =====================
   PAGE
===================== */
export default function ContactsPage() {
  const { openTab } = useTabs()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contatos`)

        if (!response.ok) {
          throw new Error("Erro ao buscar contatos")
        }

        const data = await response.json()
        setContacts(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  function irParaHistorico(e: React.MouseEvent, idChat: string) {
    e.stopPropagation()
    openTab({
      registryKey: "historico",
      key: "historico",
      label: "Histórico",
      closable: true,
      params: { chat: idChat }
    })
  }

  return (
    <div className="space-y-6 text-zinc-700">
      {/* Header */}
      <h1 className="text-2xl font-bold text-zinc-800">
        Contacts
      </h1>

      {/* Estados */}
      {loading && (
        <div className="text-sm text-zinc-500">
          Carregando contatos...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b text-zinc-800">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Telefone</th>
                <th className="p-3 text-left">Plataforma</th>
                <th className="p-3 text-left">Último contato</th>
                <th className="p-3 text-left">Histórico</th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((contact) => {
                const isOpen = expandedId === contact.id

                return (
                  <Fragment key={contact.id}>
                    {/* Linha principal */}
                    <tr
                      onClick={() =>
                        setExpandedId(isOpen ? null : contact.id)
                      }
                      className="border-b cursor-pointer hover:bg-zinc-50"
                    >
                      <td className="p-3 font-medium">
                        {contact.nome}
                      </td>

                      <td className="p-3">
                        {contact.telefone}
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          {contact.plataformas.map((p) => (
                            <PlatformTag
                              key={`${contact.id}-${p}`}
                              platform={p}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-zinc-600">
                        {formatDate(contact.funis[0]?.ultimoContato)}
                      </td>

                      <td className="p-3">
                        {contact.idChatHistorico ? (
                          <button
                            onClick={(e) => irParaHistorico(e, contact.idChatHistorico!)}
                            title="Ver histórico deste contato"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
                          >
                            <History className="h-3.5 w-3.5" />
                            Ver histórico
                          </button>
                        ) : (
                          <span
                            title="Este contato ainda não tem um atendimento finalizado"
                            className="text-xs text-zinc-400 italic"
                          >
                            Sem histórico
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expansão */}
                    {isOpen && (
                      <tr className="bg-zinc-50 border-b">
                        <td colSpan={5} className="p-4">
                          <div className="space-y-4">
                            <div className="text-sm font-semibold text-zinc-800">
                              Funis vinculados
                            </div>

                            {contact.funis.length === 0 && (
                              <div className="text-sm text-zinc-500">
                                Nenhum funil vinculado
                              </div>
                            )}

                            <div className="grid gap-3 sm:grid-cols-2">
                              {contact.funis.map((funil) => (
                                <div
                                  key={`${contact.id}-${funil.idFunil}-${funil.ultimoContato}`}
                                  className="rounded-lg border border-zinc-200 bg-white p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-zinc-800">{funil.nome}</span>
                                    <span className="text-xs text-zinc-500">
                                      {formatDate(funil.ultimoContato)}
                                    </span>
                                  </div>

                                  {funil.campos.length > 0 ? (
                                    <dl className="mt-2 space-y-1">
                                      {funil.campos.map((campo) => (
                                        <div
                                          key={campo.no_campo}
                                          className="flex justify-between gap-3 text-xs"
                                        >
                                          <dt className="text-zinc-500">{campo.no_campo}</dt>
                                          <dd className="text-zinc-700 font-medium text-right break-all">
                                            {campo.vl_campo || "-"}
                                          </dd>
                                        </div>
                                      ))}
                                    </dl>
                                  ) : (
                                    <p className="mt-2 text-xs italic text-zinc-400">
                                      Nenhum campo personalizado preenchido
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}

              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    Nenhum contato encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}