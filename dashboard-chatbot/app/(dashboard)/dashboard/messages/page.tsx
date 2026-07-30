//app/(dashboard)/dashboard/messages/page.tsx
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { io } from "socket.io-client"

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`)

const API_URL = process.env.NEXT_PUBLIC_API_URL

/* =====================
   TYPES
===================== */
type Platform = "whatsapp" | "telegram"

// Status reais usados pelo motor do funil (funil.helper.js)
type ChatStatus = "C" | "B" | "H" | "I" | "P" | "A"

type ChatMessage = {
  id: string
  platform: Platform
  fromMe: boolean
  senderName: string
  content: string
  timestamp: string
}

type Atendente = {
  id_atendente: string
  id_setor: string | null
  no_atendente: string
  no_setor?: string | null
  im_atendente?: string | null
}

type ChatThread = {
  id: string
  contactName: string
  contactNumber: string
  instanceName: string
  platform: Platform
  photo?: string
  lastSeen?: string
  status: ChatStatus
  setorId: string | null
  setorNome: string | null
  atendenteNome: string | null
  messages: ChatMessage[]
}

/* =====================
   STATUS (mapeados a partir do funil.helper.js — a tabela
   tbl_chat_status do banco está desatualizada em relação ao
   código real, então os labels abaixo seguem o backend)
===================== */
const STATUS_LABEL: Record<ChatStatus, string> = {
  C: "Cadastro",
  B: "Chatbot",
  I: "Inteligência Artificial",
  P: "Aguardando atendente",
  H: "Em atendimento",
  A: "Finalizado",
}

const STATUS_COLOR: Record<ChatStatus, string> = {
  C: "bg-zinc-400",
  B: "bg-zinc-400",
  I: "bg-purple-500",
  P: "bg-red-600",
  H: "bg-amber-500",
  A: "bg-emerald-500",
}

const ATENDENTE_STORAGE_KEY = "painel:id_atendente_ativo"

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

function StatusBadge({ status }: { status: ChatStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white px-2 py-0.5 rounded-full ${STATUS_COLOR[status]}`}
    >
      {status === "P" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      {STATUS_LABEL[status]}
    </span>
  )
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return <img src={photo} className="w-10 h-10 rounded-full object-cover" />
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
   ORDENAÇÃO: pendentes (P) sempre no topo
===================== */
function sortThreads(list: ChatThread[]): ChatThread[] {
  return [...list].sort((a, b) => {
    if (a.status === "P" && b.status !== "P") return -1
    if (b.status === "P" && a.status !== "P") return 1

    const aTime = a.messages.at(-1)?.timestamp
    const bTime = b.messages.at(-1)?.timestamp
    return (bTime ? new Date(bTime).getTime() : 0) - (aTime ? new Date(aTime).getTime() : 0)
  })
}

/* =====================
   PAGE
===================== */
export default function MessagesPage() {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [finalizando, setFinalizando] = useState(false)

  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  const [idAtendenteAtivo, setIdAtendenteAtivo] = useState<string>("")

  const activeChat = useMemo(
    () => threads.find((t) => t.id === activeChatId) ?? null,
    [threads, activeChatId]
  )

  const pendentesCount = useMemo(
    () => threads.filter((t) => t.status === "P").length,
    [threads]
  )

  /* =====================
     BOOTSTRAP
  ===================== */
  useEffect(() => {
    loadChats()
    loadAtendentes()

    const salvo = typeof window !== "undefined" ? localStorage.getItem(ATENDENTE_STORAGE_KEY) : null
    if (salvo) setIdAtendenteAtivo(salvo)
  }, [])

  /* =====================
     ATUALIZAR EM TEMPO REAL
  ===================== */
  useEffect(() => {
    function handleNewMessage(data: any) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        platform: "whatsapp",
        fromMe: data.fromMe,
        senderName: data.fromMe ? "Atendimento" : data.telefone,
        content: data.conteudo,
        timestamp: new Date().toLocaleString(),
      }

      setThreads((prev) => {
        const updated = prev.map((chat) => {
          if (chat.id !== data.idChat) return chat
          return {
            ...chat,
            status: (data.sgChatStatus as ChatStatus) || chat.status,
            messages: [...chat.messages, newMessage],
          }
        })
        return sortThreads(updated)
      })
    }

    // Se o backend também emitir um evento ao mudar status (ex: quando o
    // funil manda o chat para PENDENTE), plugue aqui o mesmo tratamento:
    function handleChatUpdated(data: any) {
      setThreads((prev) => {
        const updated = prev.map((chat) =>
          chat.id === data.idChat
            ? { ...chat, status: (data.sgChatStatus as ChatStatus) || chat.status }
            : chat
        )
        return sortThreads(updated)
      })
    }

    socket.on("NEW_MESSAGE", handleNewMessage)
    socket.on("CHAT_UPDATED", handleChatUpdated)

    return () => {
      socket.off("NEW_MESSAGE", handleNewMessage)
      socket.off("CHAT_UPDATED", handleChatUpdated)
    }
  }, [])

  async function loadAtendentes() {
    try {
      const res = await fetch(`${API_URL}/api/atendentes`)
      const json = await res.json()
      if (json.success) setAtendentes(json.data)
    } catch (err) {
      console.error("Erro ao carregar atendentes", err)
    }
  }

  function trocarAtendenteAtivo(id: string) {
    setIdAtendenteAtivo(id)
    if (typeof window !== "undefined") localStorage.setItem(ATENDENTE_STORAGE_KEY, id)
  }

  async function loadChats() {
    try {
      const res = await fetch(`${API_URL}/api/chats`)
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
        status: (chat.sg_chat_status as ChatStatus) || "B",
        setorId: chat.id_setor || null,
        setorNome: chat.no_setor || null,
        atendenteNome: chat.no_atendente || null,
        messages: chat.ultima_mensagem
          ? [
              {
                id: `preview-${chat.id_chat}`,
                platform: chat.cd_provider === 1 ? "whatsapp" : "telegram",
                fromMe: false,
                senderName: chat.no_utilizador || "-",
                content: chat.ultima_mensagem,
                timestamp: chat.dh_ultima_mensagem,
              },
            ]
          : [],
      }))

      const sorted = sortThreads(formatted)
      setThreads(sorted)

      if (sorted.length > 0 && !activeChatId) {
        loadMessages(sorted[0])
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
      const res = await fetch(`${API_URL}/api/chats/${chat.id}/messages`)
      const json = await res.json()
      if (!json.success) return

      const formattedMessages: ChatMessage[] = json.data.map((msg: any) => ({
        id: msg.id_mensagem,
        platform: chat.platform,
        fromMe: msg.from_me,
        senderName: msg.from_me ? msg.no_atendente || "Atendimento" : chat.contactName,
        content: msg.ds_conteudo,
        timestamp: new Date(msg.dh_envio).toLocaleString(),
      }))

      setThreads((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, messages: formattedMessages } : c))
      )
      setActiveChatId(chat.id)
    } catch (err) {
      console.error("Erro ao carregar mensagens", err)
    }
  }

  /* =====================
     ENVIAR MENSAGEM (via API — detecta provider no back-end
     e concatena a assinatura do atendente)
  ===================== */
  async function sendMessage() {
    if (!reply.trim() || !activeChat || sending) return

    if (!idAtendenteAtivo) {
      alert("Selecione o atendente que está usando o sistema antes de responder.")
      return
    }

    setSending(true)
    try {
      const res = await fetch(`${API_URL}/api/chats/${activeChat.id}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: reply.trim(), id_atendente: idAtendenteAtivo }),
      })
      const json = await res.json()

      if (!json.success) {
        alert(json.message || "Não foi possível enviar a mensagem.")
        return
      }

      const atendenteAtivo = atendentes.find((a) => a.id_atendente === idAtendenteAtivo)

      const newMessage: ChatMessage = {
        id: json.data.id_mensagem || Date.now().toString(),
        platform: activeChat.platform,
        fromMe: true,
        senderName: atendenteAtivo?.no_atendente || "Atendimento",
        content: json.data.ds_conteudo || reply,
        timestamp: new Date().toLocaleString(),
      }

      setThreads((prev) =>
        sortThreads(
          prev.map((chat) =>
            chat.id === activeChat.id
              ? {
                  ...chat,
                  status: chat.status === "P" ? "H" : chat.status,
                  atendenteNome: atendenteAtivo?.no_atendente || chat.atendenteNome,
                  messages: [...chat.messages, newMessage],
                }
              : chat
          )
        )
      )
      setReply("")
    } catch (err) {
      console.error("Erro ao enviar mensagem", err)
      alert("Erro ao enviar mensagem. Tente novamente.")
    } finally {
      setSending(false)
    }
  }

  /* =====================
     FINALIZAR ATENDIMENTO
  ===================== */
  async function finalizarAtendimento() {
    if (!activeChat || finalizando) return
    const confirmar = confirm(`Finalizar o atendimento de ${activeChat.contactName}?`)
    if (!confirmar) return

    setFinalizando(true)
    try {
      const res = await fetch(`${API_URL}/api/chats/${activeChat.id}/finalizar`, {
        method: "POST",
      })
      const json = await res.json()

      if (!json.success) {
        alert(json.message || "Não foi possível finalizar o atendimento.")
        return
      }

      setThreads((prev) =>
        sortThreads(
          prev.map((chat) =>
            chat.id === activeChat.id ? { ...chat, status: "A", atendenteNome: null } : chat
          )
        )
      )
    } catch (err) {
      console.error("Erro ao finalizar atendimento", err)
      alert("Erro ao finalizar atendimento. Tente novamente.")
    } finally {
      setFinalizando(false)
    }
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") sendMessage()
    },
    [reply, activeChat, idAtendenteAtivo, sending]
  )

  return (
    <div className="h-full flex flex-col bg-white rounded shadow overflow-hidden text-zinc-700">
      {/* BARRA SUPERIOR — seletor de atendente ativo */}
      <div className="flex items-center justify-between gap-4 border-b px-4 py-2 bg-zinc-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Atendendo como:</span>
          <select
            value={idAtendenteAtivo}
            onChange={(e) => trocarAtendenteAtivo(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-white"
          >
            <option value="">Selecione um atendente</option>
            {atendentes.map((a) => (
              <option key={a.id_atendente} value={a.id_atendente}>
                {a.no_atendente} {a.no_setor ? `· ${a.no_setor}` : ""}
              </option>
            ))}
          </select>
        </div>

        {pendentesCount > 0 && (
          <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            {pendentesCount} chamado{pendentesCount > 1 ? "s" : ""} aguardando atendente
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LISTA DE CHATS */}
        <aside className="w-80 border-r bg-zinc-50 overflow-y-auto">
          {threads.map((chat) => (
            <div
              key={chat.id}
              onClick={() => loadMessages(chat)}
              className={`relative flex gap-3 p-4 cursor-pointer border-b hover:bg-zinc-100 ${
                activeChat?.id === chat.id ? "bg-zinc-200" : ""
              } ${chat.status === "P" ? "bg-red-50" : ""}`}
            >
              {chat.status === "P" && (
                <span className="absolute left-1 top-1 bottom-1 w-1 rounded-full bg-red-600" />
              )}

              <Avatar name={chat.contactName} photo={chat.photo} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-zinc-800 truncate">{chat.contactName}</div>
                  {chat.status === "P" && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  )}
                </div>
                <div className="text-xs text-zinc-500">{chat.contactNumber}</div>
                {chat.setorNome && (
                  <div className="text-xs text-zinc-400">Setor: {chat.setorNome}</div>
                )}
                <div className="text-sm text-zinc-500 truncate">
                  {chat.messages.at(-1)?.content || ""}
                </div>
                <div className="flex justify-between items-center text-xs mt-1 gap-2">
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={chat.platform} />
                    <StatusBadge status={chat.status} />
                  </div>
                  <span className="text-zinc-400 shrink-0">
                    {chat.messages.at(-1)?.timestamp
                      ? new Date(chat.messages.at(-1)!.timestamp).toLocaleTimeString().slice(0, 5)
                      : ""}
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
                  <Avatar name={activeChat.contactName} photo={activeChat.photo} />
                  <div>
                    <div className="font-semibold text-zinc-800">{activeChat.contactName}</div>
                    <div className="text-sm text-zinc-500">
                      {activeChat.lastSeen
                        ? `visto por último ${new Date(activeChat.lastSeen).toLocaleString()}`
                        : activeChat.contactNumber}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={activeChat.status} />
                      {activeChat.setorNome && (
                        <span className="text-xs text-zinc-400">Setor: {activeChat.setorNome}</span>
                      )}
                      {activeChat.atendenteNome && (
                        <span className="text-xs text-zinc-400">
                          Atendente: {activeChat.atendenteNome}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PlatformBadge platform={activeChat.platform} />
                  {(activeChat.status === "H" || activeChat.status === "P") && (
                    <button
                      onClick={finalizarAtendimento}
                      disabled={finalizando}
                      className="text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded"
                    >
                      {finalizando ? "Finalizando..." : "Finalizar atendimento"}
                    </button>
                  )}
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-zinc-100">
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.fromMe ? "justify-end" : "justify-start"}`}
                  >
                    {!msg.fromMe && <Avatar name={activeChat.contactName} photo={activeChat.photo} />}

                    <div
                      className={`max-w-md px-4 py-2 rounded text-sm ${
                        msg.fromMe ? "bg-blue-600 text-white" : "bg-white text-zinc-800"
                      }`}
                    >
                      {msg.fromMe && (
                        <div className="text-[10px] opacity-70 mb-1">{msg.senderName}</div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div className="text-[10px] opacity-70 mt-1 text-right">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t p-3 flex gap-2 bg-white">
                <input
                  placeholder={
                    idAtendenteAtivo
                      ? "Digite sua mensagem..."
                      : "Selecione um atendente para responder..."
                  }
                  className="border rounded px-3 py-2 flex-1 disabled:bg-zinc-100"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!idAtendenteAtivo || sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!idAtendenteAtivo || sending || !reply.trim()}
                  className="bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded"
                >
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}