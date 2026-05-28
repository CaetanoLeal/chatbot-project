//app/(dashboard)/dashboard/funnels/components/FunnelForm.tsx
"use client"

import { useEffect, useState } from "react"

type Botao = {
  id: string
  cd_botao: number
  ds_botao: string
  cd_mensagem_destino: number | null
}

type Mensagem = {
  id: string
  cd_mensagem: number
  ds_mensagem: string
  cd_mensagem_destino: number | null
  is_aguardar: boolean
  botoes: Botao[]
}

type FunnelFormProps = {
  mode: "create" | "edit"
  initialData?: {
    id: string
    name: string
    description: string
    welcomeMessage: Mensagem
    messages: Mensagem[]
  }
}


export default function FunnelForm({ mode, initialData }: FunnelFormProps) {
  const isEdit = mode === "edit"

  const [funilId, setFunilId] = useState<string | null>(
    initialData?.id ?? null
  )

  const [saving, setSaving] = useState(false)

  const [funnelName, setFunnelName] = useState(
    initialData?.name ?? ""
  )

  const [funnelDescription, setFunnelDescription] = useState(
    initialData?.description ?? ""
  )

  const [welcomeMessage, setWelcomeMessage] = useState<Mensagem>(
    initialData?.welcomeMessage ?? {
      id: crypto.randomUUID(), // 👈 ID temporário
      cd_mensagem: 1,
      ds_mensagem: "",
      cd_mensagem_destino: null,
      is_aguardar: true,
      botoes: [],
    }
  )

  const [messages, setMessages] = useState<Mensagem[]>(
    initialData?.messages ?? []
  )

  useEffect(() => {
    if (!initialData) return

    setFunilId(initialData.id)
    setFunnelName(initialData.name)
    setFunnelDescription(initialData.description)
    setWelcomeMessage(initialData.welcomeMessage)
    setMessages(initialData.messages)
    }, [initialData])

    const isFunilCreated = Boolean(funilId)

    // Bloqueia mensagens enquanto funil não existir
    const lockMessages = mode === "create" && !isFunilCreated

    // Bloqueia dados depois que funil já foi criado
    const lockFunnelData = mode === "create" && isFunilCreated

  /* =====================
     HELPERS
  ====================== */

  function allMessages() {
    return [welcomeMessage, ...messages]
  }

  function addWelcomeButton() {
    setWelcomeMessage({
      ...welcomeMessage,
      botoes: [
        ...welcomeMessage.botoes,
        {
          id: crypto.randomUUID(),
          cd_botao: welcomeMessage.botoes.length + 1,
          ds_botao: "",
          cd_mensagem_destino: null,
        },
      ],
    })
  }

  function removeWelcomeButton(index: number) {
    setWelcomeMessage({
      ...welcomeMessage,
      botoes: welcomeMessage.botoes.filter((_, i) => i !== index),
    })
  }

  function addMessage() {
    const nextCd =
      messages.length > 0
        ? messages[messages.length - 1].cd_mensagem + 1
        : 2

    setMessages([
      ...messages,
      {
        id: crypto.randomUUID(), // ID temporário
        cd_mensagem: nextCd,
        ds_mensagem: "",
        cd_mensagem_destino: null,
        is_aguardar: true,
        botoes: [],
      },
    ])
  }

  function addButtonToMessage(cd_mensagem: number) {
    setMessages(messages.map(msg =>
      msg.cd_mensagem === cd_mensagem
        ? {
            ...msg,
            botoes: [
              ...msg.botoes,
              {
                id: crypto.randomUUID(),
                cd_botao: msg.botoes.length + 1,
                ds_botao: "",
                cd_mensagem_destino: null,
              },
            ],
          }
        : msg
    ))
  }

  function removeButtonFromMessage(cd_mensagem: number, index: number) {
    setMessages(messages.map(msg =>
      msg.cd_mensagem === cd_mensagem
        ? { ...msg, botoes: msg.botoes.filter((_, i) => i !== index) }
        : msg
    ))
  }

  function removeMessage(cd_mensagem: number) {
    setMessages(messages.filter(msg => msg.cd_mensagem !== cd_mensagem))
  }

  /* =====================
     SALVAR
  ====================== */

  async function salvarFunil() {
    if (!funnelName) {
      alert("Preencha o nome do funil")
      return
    }

    try {
      setSaving(true)

      const endpoint =
        mode === "create"
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/funis`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/funis/${funilId}`

      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: funnelName,
          description: funnelDescription || null,
          welcomeMessage,
          messages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar funil")
      }

      if (mode === "create") {
        setFunilId(data.id_funil)
        alert("✅ Funil criado com sucesso!")
      } else {
        alert("✅ Funil atualizado com sucesso!")
      }
    } catch (err: any) {
      alert(`❌ ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  /* =====================
     RENDER
  ====================== */

  return (
    <div className="h-screen overflow-y-auto p-6 space-y-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-700">
        {isEdit ? "Editar Funil" : "Criar Funil"}
      </h1>

      {/* DADOS DO FUNIL */}
      <section
        className={`bg-white text-zinc-700 rounded shadow p-6 space-y-4 ${
          lockFunnelData ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h2 className="font-semibold">Dados do funil</h2>

        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Nome do funil"
          value={funnelName}
          onChange={(e) => setFunnelName(e.target.value)}
        />

        <textarea
          className="border rounded px-3 py-2 w-full"
          placeholder="Descrição"
          defaultValue={funnelDescription ?? ""}
          onChange={(e) => setFunnelDescription(e.target.value)}
        />
      </section>

      {/* BOTÃO SALVAR */}
      <button
        onClick={salvarFunil}
        disabled={saving}
        className="bg-green-600 text-white px-6 py-3 rounded disabled:opacity-50"
      >
        {saving
          ? "Salvando..."
          : isEdit
          ? "Salvar alterações"
          : "Salvar funil"}
      </button>

      {/* MENSAGEM DE BOAS-VINDAS */}
      {lockMessages && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded text-sm">
          ⚠️ Salve o nome e a descrição do funil antes de cadastrar mensagens.
        </div>
      )}
      <section
        className={`bg-white text-zinc-700 rounded shadow p-6 space-y-4 ${
          lockMessages ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h2 className="font-semibold">Mensagem de boas-vindas</h2>

        <textarea
          className="border rounded px-3 py-2 w-full"
          value={welcomeMessage.ds_mensagem}
          onChange={(e) =>
            setWelcomeMessage({ ...welcomeMessage, ds_mensagem: e.target.value })
          }
        />

        {welcomeMessage.botoes.map((botao, index) => (
          <div key={botao.id} className="flex gap-2 items-center">
            <input
              className="border rounded px-2 py-1 flex-1"
              value={botao.ds_botao}
              onChange={(e) => {
                const botoes = [...welcomeMessage.botoes]
                botoes[index].ds_botao = e.target.value
                setWelcomeMessage({ ...welcomeMessage, botoes })
              }}
            />

            <select
              className="border rounded px-2 py-1"
              value={botao.cd_mensagem_destino ?? ""}
              onChange={(e) => {
                const botoes = [...welcomeMessage.botoes]
                botoes[index].cd_mensagem_destino =
                e.target.value === "" ? null : Number(e.target.value)
                setWelcomeMessage({ ...welcomeMessage, botoes })
              }}
            >
              <option value="">Destino</option>
              {allMessages().map(msg => (
                <option key={msg.id} value={msg.cd_mensagem}>
                  Mensagem {msg.cd_mensagem}
                </option>
              ))}
            </select>

            <button
              onClick={() => removeWelcomeButton(index)}
              className="text-red-600"
            >
              ✕
            </button>
          </div>
        ))}

        <button onClick={addWelcomeButton} className="text-blue-600 text-sm">
          + Adicionar botão
        </button>
      </section>

      {/* MENSAGENS DO CHATBOT */}
      <section
        className={`space-y-6 text-zinc-700 ${
          lockMessages ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h2 className="font-semibold text-zinc-700">
          Mensagens do chatbot
        </h2>

        {messages.map(msg => (
          <div
            key={msg.id}
            className="bg-white rounded shadow p-6 space-y-4"
          >
            <div className="flex justify-between">
              <h3 className="font-medium">Mensagem {msg.cd_mensagem}</h3>
              <button
                onClick={() => removeMessage(msg.cd_mensagem)}
                className="text-red-600 text-sm"
              >
                Apagar mensagem
              </button>
            </div>

            <textarea
              className="border rounded px-3 py-2 w-full"
              value={msg.ds_mensagem}
              onChange={(e) =>
                setMessages(messages.map(m =>
                  m.cd_mensagem === msg.cd_mensagem
                    ? { ...m, ds_mensagem: e.target.value }
                    : m
                ))
              }
            />

            {msg.botoes.map((botao, index) => (
              <div key={botao.id} className="flex gap-2 items-center">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  value={botao.ds_botao}
                  onChange={(e) => {
                    const updated = messages.map(m => {
                      if (m.cd_mensagem === msg.cd_mensagem) {
                        const botoes = [...m.botoes]
                        botoes[index].ds_botao = e.target.value
                        return { ...m, botoes }
                      }
                      return m
                    })
                    setMessages(updated)
                  }}
                />

                <select
                  className="border rounded px-2 py-1"
                  value={botao.cd_mensagem_destino ?? ""}
                  onChange={(e) => {
                    const updated = messages.map(m => {
                      if (m.cd_mensagem === msg.cd_mensagem) {
                        const botoes = [...m.botoes]
                        botoes[index].cd_mensagem_destino =
                        e.target.value === "" ? null : Number(e.target.value)
                        return { ...m, botoes }
                      }
                      return m
                    })
                    setMessages(updated)
                  }}
                >
                  <option value="">Destino</option>
                  {allMessages().map(m => (
                    <option key={m.cd_mensagem} value={m.cd_mensagem}>
                      Mensagem {m.cd_mensagem}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    removeButtonFromMessage(msg.cd_mensagem, index)
                  }
                  className="text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={() => addButtonToMessage(msg.cd_mensagem)}
              className="text-blue-600 text-sm"
            >
              + Adicionar botão
            </button>
          </div>
        ))}

        <button
          onClick={addMessage}
          className="bg-zinc-800 text-white px-4 py-2 rounded"
        >
          + Adicionar mensagem
        </button>
      </section>
        {isFunilCreated && (
          <button
            onClick={async () => {
              await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/funis/${funilId}/estrutura`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ welcomeMessage, messages }),
                }
              )
              alert("✅ Estrutura salva com sucesso!")
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Salvar mensagens
          </button>
        )}
    </div>
  )
}