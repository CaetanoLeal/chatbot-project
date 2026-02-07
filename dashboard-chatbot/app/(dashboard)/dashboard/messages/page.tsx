"use client"

import { useState } from "react"

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
  platform: Platform
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

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
      {initials}
    </div>
  )
}

/* =====================
   PAGE
===================== */
export default function MessagesPage() {
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: "1",
      contactName: "João Silva",
      contactNumber: "+55 91 99999-9999",
      platform: "whatsapp",
      messages: [
        {
          id: "m1",
          platform: "whatsapp",
          fromMe: false,
          senderName: "João Silva",
          content: "Oi, quero saber mais sobre o serviço",
          timestamp: "05/02/2026 14:30",
        },
        {
          id: "m2",
          platform: "whatsapp",
          fromMe: true,
          senderName: "Atendimento",
          content: "Claro! Em que posso te ajudar?",
          timestamp: "05/02/2026 14:31",
        },
      ],
    },
    {
      id: "2",
      contactName: "Maria Oliveira",
      contactNumber: "@maria_oliveira",
      platform: "telegram",
      messages: [
        {
          id: "m3",
          platform: "telegram",
          fromMe: false,
          senderName: "Maria Oliveira",
          content: "Vocês atendem pelo Telegram?",
          timestamp: "04/02/2026 09:10",
        },
      ],
    },
  ])

  const [activeChat, setActiveChat] = useState<ChatThread | null>(threads[0])
  const [reply, setReply] = useState("")

  function sendMessage() {
    if (!reply || !activeChat) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      platform: activeChat.platform,
      fromMe: true,
      senderName: "Atendimento",
      content: reply,
      timestamp: new Date().toLocaleString(),
    }

    setThreads((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    )

    setActiveChat({
      ...activeChat,
      messages: [...activeChat.messages, newMessage],
    })

    setReply("")
  }

  return (
    <div className="h-full flex bg-white rounded shadow overflow-hidden text-zinc-700">
      {/* LISTA DE CHATS */}
      <aside className="w-80 border-r bg-zinc-50 overflow-y-auto">
        {threads.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChat(chat)}
            className={`flex gap-3 p-4 cursor-pointer border-b hover:bg-zinc-100 ${
              activeChat?.id === chat.id ? "bg-zinc-200" : ""
            }`}
          >
            <Avatar name={chat.contactName} />

            <div className="flex-1">
              <div className="font-medium text-zinc-800">
                {chat.contactName}
              </div>
              <div className="text-xs text-zinc-500">
                {chat.contactNumber}
              </div>
              <div className="text-sm text-zinc-500 truncate">
                {chat.messages.at(-1)?.content}
              </div>
              <div className="flex justify-between text-xs mt-1">
                <PlatformBadge platform={chat.platform} />
                <span className="text-zinc-400">
                  {chat.messages.at(-1)?.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        {activeChat && (
          <div className="border-b p-4 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <Avatar name={activeChat.contactName} />
              <div>
                <div className="font-semibold text-zinc-800">
                  {activeChat.contactName}
                </div>
                <div className="text-sm text-zinc-500">
                  {activeChat.contactNumber}
                </div>
              </div>
            </div>
            <PlatformBadge platform={activeChat.platform} />
          </div>
        )}

        {/* Mensagens */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-zinc-100">
          {activeChat?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${
                msg.fromMe ? "justify-end" : "justify-start"
              }`}
            >
              {!msg.fromMe && <Avatar name={msg.senderName} />}

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
      </main>
    </div>
  )
}