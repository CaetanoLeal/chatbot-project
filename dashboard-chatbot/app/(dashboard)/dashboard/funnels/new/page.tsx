"use client"

import { useState } from "react"

type Botao = {
  cd_botao: number
  ds_botao: string
  cd_mensagem_destino: number | null
}

type Mensagem = {
  cd_mensagem: number
  ds_mensagem: string
  is_aguardar: boolean
  botoes: Botao[]
}

export default function CreateFunnelPage() {
  // Dados do funil
  const [funnelName, setFunnelName] = useState("")
  const [funnelDescription, setFunnelDescription] = useState("")
  // Mensagem de boas-vindas
  const [welcomeMessage, setWelcomeMessage] = useState<Mensagem>({
    cd_mensagem: 1,
    ds_mensagem: "",
    is_aguardar: true,
    botoes: [],
  })

  // Mensagens do chatbot
  const [messages, setMessages] = useState<Mensagem[]>([])

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
          cd_botao: welcomeMessage.botoes.length + 1,
          ds_botao: "",
          cd_mensagem_destino: null,
        },
      ],
    })
  }

  function removeWelcomeButton(index: number) {
    const botoes = welcomeMessage.botoes.filter((_, i) => i !== index)

    setWelcomeMessage({
        ...welcomeMessage,
        botoes,
    })
    }

    function removeButtonFromMessage(cd_mensagem: number, index: number) {
    setMessages(messages.map(msg => {
        if (msg.cd_mensagem === cd_mensagem) {
        return {
            ...msg,
            botoes: msg.botoes.filter((_, i) => i !== index),
        }
        }
        return msg
    }))
    }

  function addMessage() {
    const nextCd =
      messages.length > 0
        ? messages[messages.length - 1].cd_mensagem + 1
        : 2

    setMessages([
      ...messages,
      {
        cd_mensagem: nextCd,
        ds_mensagem: "",
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
                cd_botao: msg.botoes.length + 1,
                ds_botao: "",
                cd_mensagem_destino: null,
              },
            ],
          }
        : msg
    ))
  }

  function removeMessage(cd_mensagem: number) {
    // remove a mensagem
    const updatedMessages = messages.filter(
        (msg) => msg.cd_mensagem !== cd_mensagem
    )

    // remove destinos inválidos dos botões restantes
    const cleanedMessages = updatedMessages.map(msg => ({
        ...msg,
        botoes: msg.botoes.map(botao =>
        botao.cd_mensagem_destino === cd_mensagem
            ? { ...botao, cd_mensagem_destino: null }
            : botao
        ),
    }))

    // também limpa destino da mensagem de boas-vindas
    const cleanedWelcome = {
        ...welcomeMessage,
        botoes: welcomeMessage.botoes.map(botao =>
        botao.cd_mensagem_destino === cd_mensagem
            ? { ...botao, cd_mensagem_destino: null }
            : botao
        ),
    }

    setWelcomeMessage(cleanedWelcome)
    setMessages(cleanedMessages)
    }

  /* =====================
     RENDER
  ====================== */

  return (
    <div className="space-y-10 max-w-4xl">
      <h1 className="text-2xl font-bold text-zinc-700">
        Criar Funil
      </h1>

      {/* DADOS DO FUNIL */}
        <section className="bg-white text-zinc-700 rounded shadow p-6 space-y-4">
        <h2 className="font-semibold">
            Dados do funil
        </h2>

        <div className="space-y-2">
            <label className="text-sm font-medium">
            Nome do funil
            </label>
            <input
            type="text"
            placeholder="Ex: Financeiro, Suporte, Vendas..."
            className="border rounded px-3 py-2 w-full"
            value={funnelName}
            onChange={(e) => setFunnelName(e.target.value)}
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium">
            Descrição do funil
            </label>
            <textarea
            placeholder="Descreva o objetivo deste funil"
            className="border rounded px-3 py-2 w-full"
            value={funnelDescription}
            onChange={(e) => setFunnelDescription(e.target.value)}
            />
        </div>
        </section>

      {/* MENSAGEM DE BOAS-VINDAS */}
      <section className="bg-white text-zinc-700 rounded shadow p-6 space-y-4">
        <h2 className="font-semibold">
          Mensagem de boas-vindas
        </h2>

        <textarea
          placeholder="Texto da mensagem"
          className="border rounded px-3 py-2 w-full"
          value={welcomeMessage.ds_mensagem}
          onChange={(e) =>
            setWelcomeMessage({
              ...welcomeMessage,
              ds_mensagem: e.target.value,
            })
          }
        />

        {welcomeMessage.botoes.map((botao, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              placeholder={`Botão ${botao.cd_botao}`}
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
                botoes[index].cd_mensagem_destino = Number(e.target.value)
                setWelcomeMessage({ ...welcomeMessage, botoes })
              }}
            >
              <option value="">Destino</option>
              {allMessages().map(msg => (
                <option
                  key={msg.cd_mensagem}
                  value={msg.cd_mensagem}
                >
                  Mensagem {msg.cd_mensagem}
                </option>
              ))}
            </select>
            <button
                onClick={() => removeWelcomeButton(index)}
                className="text-red-600 text-sm hover:underline"
                >
                ✕
            </button>
          </div>
        ))}

        <button
          onClick={addWelcomeButton}
          className="text-blue-600 text-sm"
        >
          + Adicionar botão
        </button>
      </section>

      {/* MENSAGENS DO CHATBOT */}
      <section className="space-y-6">
        <h2 className="font-semibold text-zinc-700">
          Mensagens do chatbot
        </h2>

        {messages.map((msg) => (
          <div
            key={msg.cd_mensagem}
            className="bg-white text-zinc-700 rounded shadow p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
            <h3 className="font-medium">
                Mensagem {msg.cd_mensagem}
            </h3>

            <button
                onClick={() => removeMessage(msg.cd_mensagem)}
                className="text-red-600 text-sm hover:underline"
            >
                Apagar mensagem
            </button>
            </div>

            <textarea
              placeholder="Texto da mensagem"
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
              <div key={index} className="flex gap-2 items-center">
                <input
                  placeholder={`Botão ${botao.cd_botao}`}
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
                        botoes[index].cd_mensagem_destino = Number(e.target.value)
                        return { ...m, botoes }
                      }
                      return m
                    })
                    setMessages(updated)
                  }}
                >
                  <option value="">Destino</option>
                  {allMessages().map(m => (
                    <option
                      key={m.cd_mensagem}
                      value={m.cd_mensagem}
                    >
                      Mensagem {m.cd_mensagem}
                    </option>
                  ))}
                </select>
                <button
                onClick={() => removeButtonFromMessage(msg.cd_mensagem, index)}
                className="text-red-600 text-sm hover:underline"
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

      <button className="bg-green-600 text-white px-6 py-3 rounded">
        Salvar funil
      </button>
    </div>
  )
}