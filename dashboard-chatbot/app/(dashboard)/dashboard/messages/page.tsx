//app/(dashboard)/dashboard/messages/page.tsx
"use client"

import { useState, useEffect } from "react"
import { io } from "socket.io-client"

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`)

/* =====================
   TYPES
===================== */
type Platform = "whatsapp" | "telegram"

type ChatMessage = {
  id: string
  platform: Platform
  fromMe: boolean
  senderName: string
  content: string
  timestamp: string
}

type ChatThread = {
  id: string
  contactName: string
  contactNumber: string
  instanceName: string
  platform: Platform
  photo?: string
  lastSeen?: string
  messages: ChatMessage[]
}

/* =====================
   HELPERS
===================== */
function PlatformBadge({ platform }: { platform: Platform }) {
  return platform === "whatsapp" ? (
    <span className="text-green-600 text-xs">WhatsApp</span>
  ) : (
    <span className="text-blue-600 text-xs">Telegram</span>
  )
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return (
      <img
        src={photo}
        className="w-10 h-10 rounded-full object-cover"
      />
    )
  }

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
      {initials || "?"}
    </div>
  )
}

/* =====================
   PAGE
===================== */
export default function MessagesPage() {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null)
  const [reply, setReply] = useState("")

  /* =====================
     LOAD CHATS
  ===================== */
  useEffect(() => {
    loadChats()
  }, [])

  /* =====================
     ATUALIZAR EM TEMPO REAL
  ===================== */
  useEffect(() => {
    socket.on("NEW_MESSAGE", (data) => {

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        platform: "whatsapp",
        fromMe: data.fromMe,
        senderName: data.fromMe ? "Atendimento" : data.telefone,
        content: data.conteudo,
        timestamp: new Date().toLocaleString()
      }

      setThreads((prev) =>
        prev.map((chat) => {
          if (chat.id !== data.idChat) return chat

          const updated = {
            ...chat,
            messages: [...chat.messages, newMessage]
          }

          if (activeChat?.id === chat.id) {
            setActiveChat(updated)
          }

          return updated
        })
      )

    })

    return () => {
      socket.off("NEW_MESSAGE")
    }
  }, [activeChat])

  async function loadChats() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats`)
      const json = await res.json()

      if (!json.success) return

      const formatted: ChatThread[] = json.data.map((chat: any) => ({
        id: chat.id_chat,
        contactName: chat.no_utilizador || "Sem nome",
        contactNumber: chat.nu_telefone || "-",
        instanceName: chat.no_instancia || "Instância",
        platform: chat.cd_provider === 1 ? "whatsapp" : "telegram",
        photo: chat.ds_foto_perfil || null,
        lastSeen: chat.dh_last_seen || null,
        messages: []
      }))

      setThreads(formatted)

      if (formatted.length > 0) {
        loadMessages(formatted[0])
      }
    } catch (err) {
      console.error("Erro ao carregar chats", err)
    }
  }

  /* =====================
     LOAD MESSAGES
  ===================== */
  async function loadMessages(chat: ChatThread) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${chat.id}/messages`
      )
      const json = await res.json()

      if (!json.success) return

      const formattedMessages: ChatMessage[] = json.data.map((msg: any) => ({
        id: msg.id_mensagem,
        platform: chat.platform,
        fromMe: msg.from_me,
        senderName: msg.from_me ? "Atendimento" : chat.contactName,
        content: msg.ds_conteudo,
        timestamp: new Date(msg.dh_envio).toLocaleString()
      }))

      const updatedChat = {
        ...chat,
        messages: formattedMessages
      }

      setActiveChat(updatedChat)

      setThreads((prev) =>
        prev.map((c) => (c.id === chat.id ? updatedChat : c))
      )
    } catch (err) {
      console.error("Erro ao carregar mensagens", err)
    }
  }

  /* =====================
     SEND MESSAGE (LOCAL POR ENQUANTO)
  ===================== */
  function sendMessage() {
    if (!reply || !activeChat) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      platform: activeChat.platform,
      fromMe: true,
      senderName: "Atendimento",
      content: reply,
      timestamp: new Date().toLocaleString()
    }

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, newMessage]
    }

    setThreads((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id ? updatedChat : chat
      )
    )

    setActiveChat(updatedChat)
    setReply("")
  }

  return (
    <div className="h-full flex bg-white rounded shadow overflow-hidden text-zinc-700">
      {/* LISTA DE CHATS */}
      <aside className="w-80 border-r bg-zinc-50 overflow-y-auto">
        {threads.map((chat) => (
          <div
            key={chat.id}
            onClick={() => loadMessages(chat)}
            className={`flex gap-3 p-4 cursor-pointer border-b hover:bg-zinc-100 ${
              activeChat?.id === chat.id ? "bg-zinc-200" : ""
            }`}
          >
            <Avatar 
              name={chat.contactName} 
              photo={chat.photo}
            />
            <div className="flex-1">
              <div className="font-medium text-zinc-800">
                {chat.contactName}
              </div>
              <div className="text-xs text-zinc-500">
                {chat.contactNumber}
              </div>
              <div className="text-xs text-zinc-400">
                {chat.instanceName}
              </div>
              <div className="text-sm text-zinc-500 truncate">
                {chat.messages.at(-1)?.content || ""}
              </div>
              <div className="flex justify-between text-xs mt-1">
                <PlatformBadge platform={chat.platform} />
                <span className="text-zinc-400">
                  {chat.messages.at(-1)?.timestamp || ""}
                </span>
              </div>
            </div>
          </div>
        ))}
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col">
        {activeChat && (
          <>
            {/* Header */}
            <div className="border-b p-4 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <Avatar 
                  name={activeChat.contactName}
                  photo={activeChat.photo}
                />
                <div>
                  <div className="font-semibold text-zinc-800">
                    {activeChat.contactName}
                  </div>
                  <div className="text-sm text-zinc-500">
                    {activeChat.lastSeen
                      ? `visto por último ${new Date(activeChat.lastSeen).toLocaleString()}`
                      : activeChat.contactNumber}
                  </div>
                </div>
              </div>
              <PlatformBadge platform={activeChat.platform} />
            </div>

            {/* Mensagens */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-zinc-100">
              {activeChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    msg.fromMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {!msg.fromMe && <Avatar name={activeChat.contactName} photo={activeChat.photo} />}

                  <div
                    className={`max-w-md px-4 py-2 rounded text-sm ${
                      msg.fromMe
                        ? "bg-blue-600 text-white"
                        : "bg-white text-zinc-800"
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className="text-[10px] opacity-70 mt-1 text-right">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2 bg-white">
              <input
                placeholder="Digite sua mensagem..."
                className="border rounded px-3 py-2 flex-1"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}