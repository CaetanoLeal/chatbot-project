// app/(dashboards)/dashboard/history/page.tsx
"use client"
import { useState, useEffect, useMemo, useRef, Suspense } from "react"
import { useTabs } from "../context/tabs-context"
import { Search, History as HistoryIcon, Inbox } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const PAGE_SIZE = 30

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
  dhEnvio: string
}

type ChatThread = {
  id: string
  contactName: string
  contactNumber: string
  instanceName: string
  platform: Platform
  photo?: string
  lastSeen?: string
  setorNome: string | null
  atendenteNome: string | null
  messages: ChatMessage[]
}

/* =====================
   HELPER COMPONENTS
===================== */
function PlatformBadge({ platform }: { platform: Platform }) {
  return platform === "whatsapp" ? (
    <span className="text-emerald-600 font-medium text-[10px] uppercase">WhatsApp</span>
  ) : (
    <span className="text-blue-600 font-medium text-[10px] uppercase">Telegram</span>
  )
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return <img src={photo} alt={name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
  }

  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
      {initials || "?"}
    </div>
  )
}

/* =====================
   ORDENAÇÃO — mais recentes primeiro
===================== */
function sortThreads(list: ChatThread[]): ChatThread[] {
  return [...list].sort((a, b) => {
    const aTime = a.messages.at(-1)?.dhEnvio
    const bTime = b.messages.at(-1)?.dhEnvio
    return (bTime ? new Date(bTime).getTime() : 0) - (aTime ? new Date(aTime).getTime() : 0)
  })
}

function formatChatFromApi(chat: any): ChatThread {
  return {
    id: String(chat.id_chat),
    contactName: chat.no_utilizador || "Sem nome",
    contactNumber: chat.nu_telefone || "-",
    instanceName: chat.no_instancia || "Instância",
    platform: chat.cd_provider === 1 ? "whatsapp" : "telegram",
    photo: chat.ds_foto_perfil || null,
    lastSeen: chat.dh_last_seen || null,
    setorNome: chat.no_setor || null,
    atendenteNome: chat.no_atendente || null,

    messages: chat.ultima_mensagem && chat.dh_ultima_mensagem
      ? [
          {
            id: `preview-${chat.id_chat}`,
            platform: chat.cd_provider === 1 ? "whatsapp" : "telegram",
            fromMe: false,
            senderName: chat.no_utilizador || "-",
            content: chat.ultima_mensagem,
            timestamp: new Date(chat.dh_ultima_mensagem).toLocaleString(),
            dhEnvio: chat.dh_ultima_mensagem,
          },
        ]
      : [],
  }
}
/* =====================
   PAGE (Adaptado para o sistema de Abas)
===================== */
export default function HistoryPage(props: any) {

  const rawChatId = props.chat || props?.params?.chat;
  const chatIdDaUrl = rawChatId ? String(rawChatId) : null;

  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [busca, setBusca] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const activeChat = useMemo(() => threads.find((t) => t.id === activeChatId) ?? null, [threads, activeChatId])

  const threadsFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return threads
    return threads.filter(
      (t) =>
        t.contactName.toLowerCase().includes(termo) ||
        t.contactNumber.toLowerCase().includes(termo)
    )
  }, [threads, busca])

  useEffect(() => {
    loadHistorico()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
  }, [activeChat?.id, activeChat?.messages.at(-1)?.id])

  useEffect(() => {
    setHasMore(true)
  }, [activeChatId])

  /* Abre automaticamente o chat vindo dos parâmetros da aba */
    useEffect(() => {
      if (loading || !chatIdDaUrl || activeChatId === chatIdDaUrl) return
      
      const alvo = threads.find((t) => t.id === chatIdDaUrl)
      if (alvo) loadMessages(alvo)
      
    }, [loading, chatIdDaUrl, threads, activeChatId])

  /* =====================
     API CALLS E RENDER 
     (Todo o resto do seu código permanece exatamente igual daqui para baixo)
  ===================== */
  async function loadHistorico() {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/chats?status=A`)
      const json = await res.json()
      if (!json.success) return

      const somenteAbertos = (json.data || []).filter((c: any) => c.sg_chat_status === "A")
      const formatted = somenteAbertos.map(formatChatFromApi)
      setThreads(sortThreads(formatted))
    } catch (err) {
      console.error("Erro ao carregar histórico", err)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(chat: ChatThread) {
    try {
      const res = await fetch(`${API_URL}/api/chats/${chat.id}/messages?limit=${PAGE_SIZE}`)
      const json = await res.json()
      if (!json.success) return

      const formattedMessages: ChatMessage[] = json.data.map((msg: any) => {
        let cleanContent = msg.ds_conteudo || ""
        if (msg.from_me) cleanContent = cleanContent.replace(/\s*_[^_]+_$/, "")

        return {
          id: msg.id_mensagem,
          platform: chat.platform,
          fromMe: msg.from_me,
          senderName: msg.from_me ? msg.no_atendente || "sistema" : chat.contactName,
          content: cleanContent,
          timestamp: new Date(msg.dh_envio).toLocaleString(),
          dhEnvio: msg.dh_envio,
        }
      })

      setThreads((prev) => prev.map((c) => (c.id === chat.id ? { ...c, messages: formattedMessages } : c)))
      setActiveChatId(chat.id)
      setHasMore(json.data.length === PAGE_SIZE)
    } catch (err) {
      console.error("Erro ao carregar mensagens", err)
    }
  }

  async function loadMoreMessages() {
    if (!activeChat || loadingMore || !hasMore) return
    const oldest = activeChat.messages[0]
    if (!oldest?.dhEnvio) return

    setLoadingMore(true)
    const container = messagesContainerRef.current
    const previousScrollHeight = container?.scrollHeight ?? 0

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        before_dh_envio: oldest.dhEnvio,
        before_id: oldest.id,
      })

      const res = await fetch(`${API_URL}/api/chats/${activeChat.id}/messages?${params}`)
      const json = await res.json()
      if (!json.success) return

      const olderMessages: ChatMessage[] = json.data.map((msg: any) => {
        let cleanContent = msg.ds_conteudo || ""
        if (msg.from_me) cleanContent = cleanContent.replace(/\s*_[^_]+_$/, "")

        return {
          id: msg.id_mensagem,
          platform: activeChat.platform,
          fromMe: msg.from_me,
          senderName: msg.from_me ? msg.no_atendente || "sistema" : activeChat.contactName,
          content: cleanContent,
          timestamp: new Date(msg.dh_envio).toLocaleString(),
          dhEnvio: msg.dh_envio,
        }
      })

      if (olderMessages.length === 0) {
        setHasMore(false)
        return
      }

      setThreads((prev) =>
        prev.map((c) =>
          c.id === activeChat.id ? { ...c, messages: [...olderMessages, ...c.messages] } : c
        )
      )
      setHasMore(olderMessages.length === PAGE_SIZE)

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - previousScrollHeight
        }
      })
    } catch (err) {
      console.error("Erro ao carregar mensagens antigas", err)
    } finally {
      setLoadingMore(false)
    }
  }

  function handleMessagesScroll(e: React.UIEvent<HTMLDivElement>) {
    if (e.currentTarget.scrollTop < 150) {
      loadMoreMessages()
    }
  }

  const renderChatCard = (chat: ChatThread) => (
    <div
      key={chat.id}
      onClick={() => loadMessages(chat)}
      className={`relative flex flex-col gap-2 p-3 mx-2 mt-2 cursor-pointer border rounded-md shadow-sm transition-colors hover:border-zinc-300 bg-white ${
        activeChat?.id === chat.id ? "ring-2 ring-zinc-800 border-transparent" : "border-zinc-200"
      }`}
    >
      <div className="flex gap-3 items-center">
        <Avatar name={chat.contactName} photo={chat.photo} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-900 text-sm truncate">{chat.contactName}</div>
          <div className="text-xs text-zinc-500 font-mono mt-0.5">{chat.contactNumber}</div>
        </div>
      </div>

      <div className="text-xs text-zinc-600 truncate bg-zinc-50 p-1.5 rounded">
        {chat.messages.at(-1)?.content || <span className="italic text-zinc-400">Sem mensagens</span>}
      </div>

      <div className="flex justify-between items-center text-xs mt-1">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={chat.platform} />
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded bg-emerald-500">
            Finalizado
          </span>
        </div>
        <span className="text-zinc-400 font-medium">
          {chat.messages.at(-1)?.timestamp ? new Date(chat.messages.at(-1)!.timestamp).toLocaleDateString().slice(0, 5) : ""}
        </span>
      </div>
    </div>
  )

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden text-zinc-800 font-sans">
      <header className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3 bg-white shadow-sm z-10">
        <div className="rounded-lg bg-zinc-100 p-2 text-zinc-600">
          <HistoryIcon size={18} />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-zinc-800">Histórico de Atendimentos</h1>
          <p className="text-xs text-zinc-500">Somente visualização — conversas já finalizadas</p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[320px] flex flex-col border-r border-zinc-200 shrink-0 bg-zinc-50/50">
          <div className="p-3 bg-white border-b border-zinc-200 sticky top-0 z-10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou número..."
                className="w-full h-9 pl-9 pr-3 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-zinc-800 transition-shadow"
              />
            </div>
            <div className="text-xs text-zinc-400 mt-2 px-0.5">
              {loading ? "Carregando..." : `${threadsFiltradas.length} encontrado${threadsFiltradas.length === 1 ? "" : "s"}`}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            {!loading && threadsFiltradas.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400 gap-3 px-6 text-center">
                <Inbox size={28} className="text-zinc-300" />
                <p className="text-sm">Nenhum atendimento finalizado encontrado.</p>
              </div>
            )}
            {threadsFiltradas.map(renderChatCard)}
          </div>
        </div>

        <main className="flex-1 flex flex-col bg-white min-w-[400px]">
          {activeChat ? (
            <>
              <div className="border-b border-zinc-200 p-4 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <Avatar name={activeChat.contactName} photo={activeChat.photo} />
                  <div>
                    <div className="font-bold text-zinc-900 text-lg leading-tight">{activeChat.contactName}</div>
                    <div className="text-sm text-zinc-500 mb-1">
                      {activeChat.lastSeen ? `Visto por último ${new Date(activeChat.lastSeen).toLocaleString()}` : activeChat.contactNumber}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded bg-emerald-500">
                        Finalizado
                      </span>
                      {activeChat.setorNome && <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">Setor: {activeChat.setorNome}</span>}
                      {activeChat.atendenteNome && <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">Resp: {activeChat.atendenteNome}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PlatformBadge platform={activeChat.platform} />
                </div>
              </div>

              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 p-6 space-y-6 overflow-y-auto bg-zinc-50/30"
              >
                {loadingMore && (
                  <div className="text-center text-xs text-zinc-400 py-2">Carregando mensagens antigas...</div>
                )}
                {activeChat.messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                    {!msg.fromMe && <Avatar name={activeChat.contactName} photo={activeChat.photo} />}
                    <div className={`max-w-[70%] px-4 py-3 rounded-xl shadow-sm text-[15px] leading-relaxed ${msg.fromMe ? "bg-zinc-900 text-zinc-50 rounded-tr-none" : "bg-white border border-zinc-200 text-zinc-800 rounded-tl-none"}`}>
                      <div className="whitespace-pre-wrap">
                        {msg.fromMe && msg.senderName?.toLowerCase() !== "sistema" && msg.senderName !== activeChat.atendenteNome
                          ? <div className="text-xs opacity-70 mb-1 font-semibold">{msg.senderName}</div>
                          : null}
                        {msg.content}
                      </div>
                      <div className={`text-[10px] mt-2 text-right ${msg.fromMe ? "text-zinc-400" : "text-zinc-400"}`}>{msg.timestamp}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-zinc-200 px-4 py-3 bg-zinc-50 text-center text-xs text-zinc-400">
                Este atendimento já foi finalizado. Modo somente leitura.
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400 flex-col gap-4 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                <HistoryIcon size={28} className="text-zinc-300" />
              </div>
              {chatIdDaUrl && !loading ? (
                <p>Essa conversa ainda não está no histórico (só entram atendimentos já finalizados).</p>
              ) : (
                <p>Selecione uma conversa ao lado para visualizar o histórico</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}