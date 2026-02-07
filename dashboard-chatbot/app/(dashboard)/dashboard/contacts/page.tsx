"use client"

import { useState, Fragment } from "react"

/* =====================
   TYPES
===================== */
type Platform = "whatsapp" | "telegram"

type FunilContato = {
  nome: string
  ultimoContato: string
}

type Contact = {
  id: string
  nome: string
  telefone: string
  plataformas: Platform[]
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

/* =====================
   PAGE
===================== */
export default function ContactsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const contacts: Contact[] = [
    {
      id: "1",
      nome: "João Silva",
      telefone: "+55 91 98888-7777",
      plataformas: ["whatsapp"],
      funis: [
        {
          nome: "Funil WhatsApp",
          ultimoContato: "05/02/2026 14:32",
        },
      ],
    },
    {
      id: "2",
      nome: "Maria Oliveira",
      telefone: "+55 91 97777-6666",
      plataformas: ["whatsapp", "telegram"],
      funis: [
        {
          nome: "Funil WhatsApp",
          ultimoContato: "04/02/2026 18:10",
        },
        {
          nome: "Funil Telegram",
          ultimoContato: "03/02/2026 09:45",
        },
      ],
    },
  ]

  return (
    <div className="space-y-6 text-zinc-700">
      {/* Header */}
      <h1 className="text-2xl font-bold text-zinc-800">
        Contacts
      </h1>

      {/* Tabela */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b text-zinc-800">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Telefone</th>
              <th className="p-3 text-left">Plataforma</th>
              <th className="p-3 text-left">Último contato</th>
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
                        {contact.funis[0]?.ultimoContato ?? "-"}
                    </td>
                    </tr>

                    {/* Expansão */}
                    {isOpen && (
                    <tr className="bg-zinc-50 border-b">
                        <td colSpan={4} className="p-4">
                        <div className="space-y-2">
                            <div className="text-sm font-semibold text-zinc-800">
                            Funis vinculados
                            </div>

                            <ul className="space-y-1 text-sm">
                            {contact.funis.map((funil) => (
                                <li
                                key={`${contact.id}-${funil.nome}`}
                                className="flex justify-between"
                                >
                                <span>{funil.nome}</span>
                                <span className="text-zinc-500">
                                    Último contato: {funil.ultimoContato}
                                </span>
                                </li>
                            ))}
                            </ul>
                        </div>
                        </td>
                    </tr>
                    )}
                </Fragment>
                )
            })}
            </tbody>
        </table>
      </div>
    </div>
  )
}