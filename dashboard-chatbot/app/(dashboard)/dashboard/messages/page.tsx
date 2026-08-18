"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { io } from "socket.io-client"
import { Zap, ChevronLeft, ChevronRight, X } from "lucide-react"

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`)

const API_URL = process.env.NEXT_PUBLIC_API_URL
const SYSTEM_ATENDENTE_ID = "00000000-0000-0000-0000-000000000000"
const ATENDENTE_PREFIX_REGEX = /^Mensagem de \*[^*]+\*:\s*/

/* =====================
   TYPES
===================== */
type Platform = "whatsapp" | "telegram"

type ChatStatus = "C" | "B" | "H" | "I" | "P" | "A"

type ChatMessage = {
  id: string
  platform: Platform
  fromMe: boolean
  senderName: string
  content: string
  timestamp: string
  dhEnvio: string
}

type Setor = {
  id_setor: string
  no_setor: string
}

// Tipos de atalho conforme tbl_atalho_tipo
// G = GERAL, B = BOAS-VINDAS, E = ENCERRAMENTO, T = TRANSFERÊNCIA, F = FECHADO
type AtalhoTipo = "G" | "B" | "E" | "T" | "F"

type MensagemPredefinida = {
  id_atalho: string
  no_atalho: string
  ds_atalho: string
  sg_atalho_tipo: AtalhoTipo
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
   SELEÇÃO DE PREDEFINIDA (modal)
===================== */
type AcaoComPredefinida = "iniciar" | "finalizar" | "transferir"

type SelecaoPredefinidaState = {
  acao: AcaoComPredefinida
  tipo: AtalhoTipo
  opcoes: MensagemPredefinida[]
  chatId: string
  contactName: string
  // chamado com a mensagem escolhida (ou null se o usuário optar por não enviar nada)
  onConfirm: (msg: MensagemPredefinida | null) => void
} | null

/* =====================
   STATUS MAPS
===================== */
const STATUS_LABEL: Record<ChatStatus, string> = {
  C: "Cadastro",
  B: "Chatbot",
  I: "IA",
  P: "Aguardando",
  H: "Em atendimento",
  A: "Finalizado",
}

const STATUS_COLOR: Record<ChatStatus, string> = {
  C: "bg-zinc-400",
  B: "bg-zinc-400",
  I: "bg-purple-500",
  P: "bg-red-500",
  H: "bg-amber-500",
  A: "bg-emerald-500",
}

const ATENDENTE_STORAGE_KEY = "painel:id_atendente_ativo"
const AUTO_ENVIO_STORAGE_KEY = "painel:auto_envio_predefinida"
const PAGE_SIZE = 30

const ACAO_TITULO: Record<AcaoComPredefinida, string> = {
  iniciar: "Iniciar atendimento",
  finalizar: "Finalizar atendimento",
  transferir: "Transferir atendimento",
}

const ACAO_DESCRICAO: Record<AcaoComPredefinida, string> = {
  iniciar: "Existe mais de uma mensagem de boas-vindas cadastrada. Escolha qual enviar ao iniciar o atendimento:",
  finalizar: "Existe mais de uma mensagem de encerramento cadastrada. Escolha qual enviar antes de finalizar:",
  transferir: "Existe mais de uma mensagem de transferência cadastrada. Escolha qual enviar antes de transferir:",
}

/* =====================
   HELPERS COMPONENTS
===================== */
function PlatformBadge({ platform }: { platform: Platform }) {
  return platform === "whatsapp" ? (
    <span className="text-emerald-600 font-medium text-[10px] uppercase">WhatsApp</span>
  ) : (
    <span className="text-blue-600 font-medium text-[10px] uppercase">Telegram</span>
  )
}

function StatusBadge({ status }: { status: ChatStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded ${STATUS_COLOR[status]}`}>
      {status === "P" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      {STATUS_LABEL[status]}
    </span>
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

function stripAttendantPrefix(content: string) {
  return content.replace(ATENDENTE_PREFIX_REGEX, "")
}

/* =====================
   ORDENAÇÃO
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
  const [setores, setSetores] = useState<Setor[]>([])
  const [transferindo, setTransferindo] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [iniciandoAtendimento, setIniciandoAtendimento] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const [mensagensPredefinidas, setMensagensPredefinidas] = useState<MensagemPredefinida[]>([])
  const [mostrarPredefinidas, setMostrarPredefinidas] = useState(false)
  const predefinidasRef = useRef<HTMLDivElement>(null)

  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  const [idAtendenteAtivo, setIdAtendenteAtivo] = useState<string>("")

  // Switch geral: liga/desliga o envio automático de mensagens predefinidas
  // ao iniciar / finalizar / transferir atendimentos.
  const [autoEnviarPredefinida, setAutoEnviarPredefinida] = useState<boolean>(true)

  // Estado do modal de escolha quando há 2+ mensagens predefinidas do mesmo tipo
  const [selecaoPredefinida, setSelecaoPredefinida] = useState<SelecaoPredefinidaState>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChat = useMemo(() => threads.find((t) => t.id === activeChatId) ?? null, [threads, activeChatId])
  const pendentesCount = useMemo(() => threads.filter((t) => t.status === "P").length, [threads])

  // KANBAN COLUMNS: Derivando os estados para distribuir nas colunas automaticamente
  const automatizados = useMemo(() => threads.filter((t) => ["B", "C", "I"].includes(t.status)), [threads])
  const aguardando = useMemo(() => threads.filter((t) => t.status === "P"), [threads])
  const meusAtendimentos = useMemo(() => threads.filter((t) => ["H"].includes(t.status)), [threads])
  const [collapsedColumns, setCollapsedColumns] = useState<Record<"automatizado" | "aguardando" | "meus", boolean>>({
    automatizado: false,
    aguardando: false,
    meus: false,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
  }, [activeChat?.id, activeChat?.messages.at(-1)?.id])

  useEffect(() => {
    setHasMore(true)
  }, [activeChatId])

  /* =====================
     BOOTSTRAP & SOCKETS
  ===================== */
  useEffect(() => {
    loadChats()
    loadAtendentes()
    loadSetores()
    loadMensagensPredefinidas()
    const salvo = typeof window !== "undefined" ? localStorage.getItem(ATENDENTE_STORAGE_KEY) : null
    if (salvo) setIdAtendenteAtivo(salvo)

    const autoSalvo = typeof window !== "undefined" ? localStorage.getItem(AUTO_ENVIO_STORAGE_KEY) : null
    if (autoSalvo !== null) setAutoEnviarPredefinida(autoSalvo === "1")
  }, [])

  useEffect(() => {
    function handleNewMessage(data: any) {
      let cleanContent = data.conteudo || ""
      if (data.fromMe) {
        cleanContent = cleanContent.replace(/\s*_[^_]+_$/, "")
        cleanContent = stripAttendantPrefix(cleanContent) // 👈 novo
      }

      const newMessage: ChatMessage = {
        id: data.id_mensagem || data.idChat + Date.now().toString(),
        platform: "whatsapp",
        fromMe: data.fromMe,
        senderName: data.fromMe ? (data.no_atendente || "sistema") : data.telefone,
        content: cleanContent,
        timestamp: data.dh_envio
          ? new Date(data.dh_envio).toLocaleString()
          : new Date().toLocaleString(),
        dhEnvio: data.dh_envio || new Date().toISOString(),
      }

      setThreads((prev) => {
        const updated = prev.map((chat) => {
          if (chat.id !== data.idChat) return chat
          const jaExiste = chat.messages.some((m) => m.id === data.id_mensagem || (m.fromMe && m.content === cleanContent))
          if (jaExiste) return chat
          return {
            ...chat,
            status: (data.sgChatStatus as ChatStatus) || chat.status,
            messages: [...chat.messages, newMessage],
          }
        })
        return sortThreads(updated)
      })
    }

    function handleChatUpdated(data: any) {
      if (data.sgChatStatus === "A") {
        setThreads((prev) => prev.filter((chat) => chat.id !== data.idChat))
        setActiveChatId((prev) => (prev === data.idChat ? null : prev))
        return
      }

      setThreads((prev) => {
        const updated = prev.map((chat) =>
          chat.id === data.idChat
            ? {
                ...chat,
                status: (data.sgChatStatus as ChatStatus) || chat.status,
                setorId: data.idSetor ?? chat.setorId,
                setorNome: data.noSetor ?? chat.setorNome,
              }
            : chat
        )
        return sortThreads(updated)
      })
    }

    function handleNewChat(chatCompleto: any) {
      setThreads((prev) => {
        if (prev.some((t) => t.id === chatCompleto.id_chat)) return prev
        const novoChat = formatChatFromApi(chatCompleto)
        if (novoChat.status === "A") return prev // 👈 ignora finalizados
        return sortThreads([novoChat, ...prev])
      })
    }

    function handleChatContactUpdated(data: any) {
      setThreads((prev) =>
        prev.map((chat) =>
          chat.id === data.idChat
            ? {
                ...chat,
                photo: data.fotoPerfil ?? chat.photo,
                lastSeen: data.lastSeen ?? chat.lastSeen,
              }
            : chat
        )
      )
    }

    socket.on("NEW_MESSAGE", handleNewMessage)
    socket.on("CHAT_UPDATED", handleChatUpdated)
    socket.on("NEW_CHAT", handleNewChat)
    socket.on("CHAT_CONTACT_UPDATED", handleChatContactUpdated) // NOVO

    return () => {
      socket.off("NEW_MESSAGE", handleNewMessage)
      socket.off("CHAT_UPDATED", handleChatUpdated)
      socket.off("NEW_CHAT", handleNewChat)
      socket.off("CHAT_CONTACT_UPDATED", handleChatContactUpdated) // NOVO
    }
  }, [])

  /* =====================
     FECHAR DROPDOWN DE PREDEFINIDAS AO CLICAR FORA
  ===================== */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (predefinidasRef.current && !predefinidasRef.current.contains(e.target as Node)) {
        setMostrarPredefinidas(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* =====================
     API CALLS
  ===================== */
  async function loadAtendentes() {
    try {
      const res = await fetch(`${API_URL}/api/atendentes`)
      const json = await res.json()
      const rawData = Array.isArray(json) ? json : (json.data || [])
      setAtendentes(rawData.filter((a: Atendente) => a.id_atendente !== SYSTEM_ATENDENTE_ID))
    } catch (err) {
      console.error("Erro ao carregar atendentes", err)
    }
  }

  async function loadSetores() {
    try {
      const res = await fetch(`${API_URL}/api/setores`)
      const json = await res.json()
      const rawData = Array.isArray(json) ? json : json.data || []
      setSetores(rawData)
    } catch (err) {
      console.error("Erro ao carregar setores", err)
    }
  }

  async function loadMensagensPredefinidas() {
    try {
      const res = await fetch(`${API_URL}/api/mensagens-predefinidas`)
      const json = await res.json()
      if (!json.success) return
      setMensagensPredefinidas(json.data || [])
    } catch (err) {
      console.error("Erro ao carregar mensagens predefinidas", err)
    }
  }

  function usarMensagemPredefinida(mensagem: MensagemPredefinida) {
    setReply(mensagem.ds_atalho)
    setMostrarPredefinidas(false)
  }

  function trocarAtendenteAtivo(id: string) {
    setIdAtendenteAtivo(id)
    if (typeof window !== "undefined") localStorage.setItem(ATENDENTE_STORAGE_KEY, id)
  }

  function alternarAutoEnvio() {
    setAutoEnviarPredefinida((prev) => {
      const novo = !prev
      if (typeof window !== "undefined") localStorage.setItem(AUTO_ENVIO_STORAGE_KEY, novo ? "1" : "0")
      return novo
    })
  }

  // Retorna as mensagens predefinidas cadastradas para um tipo específico (B, E, T...)
  function mensagensPorTipo(tipo: AtalhoTipo): MensagemPredefinida[] {
    return mensagensPredefinidas.filter((m) => m.sg_atalho_tipo === tipo)
  }

  function formatChatFromApi(chat: any): ChatThread {
  return {
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

  async function loadChats() {
    try {
      const res = await fetch(`${API_URL}/api/chats`)
      const json = await res.json()
      if (!json.success) return

      const formatted: ChatThread[] = json.data
        .map(formatChatFromApi)
        .filter((chat: ChatThread) => chat.status !== "A")   // 👈 nunca carregar finalizados

      const sorted = sortThreads(formatted)
      setThreads(sorted)
      if (sorted.length > 0 && !activeChatId) loadMessages(sorted[0])
    } catch (err) {
      console.error("Erro ao carregar chats", err)
    }
  }

  async function loadMessages(chat: ChatThread) {
    try {
      const res = await fetch(`${API_URL}/api/chats/${chat.id}/messages?limit=${PAGE_SIZE}`)
      const json = await res.json()
      if (!json.success) return

      const formattedMessages: ChatMessage[] = json.data.map((msg: any) => {
        let cleanContent = msg.ds_conteudo || ""
        if (msg.from_me) {
          cleanContent = cleanContent.replace(/\s*_[^_]+_$/, "")
          cleanContent = stripAttendantPrefix(cleanContent)
         }

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
        if (msg.from_me) {
          cleanContent = cleanContent.replace(/\s*_[^_]+_$/, "")
          cleanContent = stripAttendantPrefix(cleanContent)
        }

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

  function toggleColumn(key: "automatizado" | "aguardando" | "meus") {
    setCollapsedColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  /* =====================
     ENVIO DE MENSAGEM (genérico, usado tanto pelo input quanto pelo fluxo automático)
  ===================== */
  // Envia uma mensagem de texto para um chat específico sem depender do estado `reply`.
  // Usado internamente pelas rotinas de iniciar/finalizar/transferir com predefinidas.
  async function enviarMensagemDireta(chatId: string, texto: string): Promise<boolean> {
    if (!texto.trim()) return true
    if (!idAtendenteAtivo) {
      alert("Selecione o atendente que está usando o sistema antes de enviar mensagens.")
      return false
    }

    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: texto.trim(), id_atendente: idAtendenteAtivo }),
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.message || "Não foi possível enviar a mensagem predefinida.")
        return false
      }

      const atendenteAtivo = atendentes.find((a) => a.id_atendente === idAtendenteAtivo)
      const newMessage: ChatMessage = {
        id: json.data.id_mensagem || Date.now().toString(),
        platform: "whatsapp",
        fromMe: true,
        senderName: atendenteAtivo?.no_atendente || "sistema",
        content: texto.trim(),
        timestamp: json.data.dh_envio
          ? new Date(json.data.dh_envio).toLocaleString()
          : new Date().toLocaleString(),
        dhEnvio: json.data.dh_envio || new Date().toISOString(),
      }

      setThreads((prev) =>
        sortThreads(
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  atendenteNome: atendenteAtivo?.no_atendente || chat.atendenteNome,
                  messages: [...chat.messages, newMessage],
                }
              : chat
          )
        )
      )
      return true
    } catch (err) {
      alert("Erro ao enviar mensagem predefinida. Tente novamente.")
      return false
    }
  }

  async function sendMessage() {
    if (!reply.trim() || !activeChat || sending) return
    if (!idAtendenteAtivo) return alert("Selecione o atendente que está usando o sistema antes de responder.")

    setSending(true)
    try {
      const ok = await enviarMensagemDireta(activeChat.id, reply)
      if (ok) {
        // sendMessage também garante a transição de status P -> H quando o atendente responde manualmente
        setThreads((prev) =>
          sortThreads(
            prev.map((chat) =>
              chat.id === activeChat.id && chat.status === "P" ? { ...chat, status: "H" } : chat
            )
          )
        )
        setReply("")
      }
    } finally {
      setSending(false)
    }
  }

  /* =====================
     INICIAR ATENDIMENTO (com lógica de mensagem de boas-vindas - tipo B)
  ===================== */
  async function executarIniciarBase(chatId: string): Promise<boolean> {
    setIniciandoAtendimento(true)
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/iniciar`, { method: "POST" })
      const json = await res.json()

      if (!json.success) {
        alert(json.message || "Não foi possível iniciar o atendimento.")
        return false
      }

      setThreads((prev) =>
        sortThreads(prev.map((chat) => (chat.id === chatId ? { ...chat, status: "H" } : chat)))
      )
      return true
    } catch (err) {
      alert("Erro ao iniciar atendimento. Tente novamente.")
      return false
    } finally {
      setIniciandoAtendimento(false)
    }
  }

  async function iniciarAtendimento() {
    if (!activeChat || iniciandoAtendimento) return
    const chatId = activeChat.id
    const contactName = activeChat.contactName

    // Switch desligado: comportamento antigo, sem enviar nada automaticamente
    if (!autoEnviarPredefinida) {
      await executarIniciarBase(chatId)
      return
    }

    const opcoes = mensagensPorTipo("B")

    if (opcoes.length === 0) {
      await executarIniciarBase(chatId)
      return
    }

    if (opcoes.length === 1) {
      const ok = await executarIniciarBase(chatId)
      if (ok) await enviarMensagemDireta(chatId, opcoes[0].ds_atalho)
      return
    }

    // 2 ou mais mensagens de boas-vindas cadastradas: pede pro usuário escolher
    setSelecaoPredefinida({
      acao: "iniciar",
      tipo: "B",
      opcoes,
      chatId,
      contactName,
      onConfirm: async (msg) => {
        setSelecaoPredefinida(null)
        const ok = await executarIniciarBase(chatId)
        if (ok && msg) await enviarMensagemDireta(chatId, msg.ds_atalho)
      },
    })
  }

  /* =====================
     FINALIZAR ATENDIMENTO (envia mensagem de encerramento - tipo E - antes de finalizar)
  ===================== */
  async function executarFinalizarBase(chatId: string): Promise<boolean> {
    setFinalizando(true)
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/finalizar`, { method: "POST" })
      const json = await res.json()
      if (!json.success) {
        alert(json.message || "Não foi possível finalizar o atendimento.")
        return false
      }

      setThreads((prev) => prev.filter((chat) => chat.id !== chatId))
      setActiveChatId((prev) => (prev === chatId ? null : prev))
      return true
    } catch (err) {
      alert("Erro ao finalizar atendimento. Tente novamente.")
      return false
    } finally {
      setFinalizando(false)
    }
  }

  async function finalizarAtendimento() {
    if (!activeChat || finalizando) return
    if (!confirm(`Finalizar o atendimento de ${activeChat.contactName}?`)) return

    const chatId = activeChat.id
    const contactName = activeChat.contactName

    if (!autoEnviarPredefinida) {
      await executarFinalizarBase(chatId)
      return
    }

    const opcoes = mensagensPorTipo("E")

    if (opcoes.length === 0) {
      await executarFinalizarBase(chatId)
      return
    }

    if (opcoes.length === 1) {
      await enviarMensagemDireta(chatId, opcoes[0].ds_atalho)
      await executarFinalizarBase(chatId)
      return
    }

    setSelecaoPredefinida({
      acao: "finalizar",
      tipo: "E",
      opcoes,
      chatId,
      contactName,
      onConfirm: async (msg) => {
        setSelecaoPredefinida(null)
        if (msg) await enviarMensagemDireta(chatId, msg.ds_atalho)
        await executarFinalizarBase(chatId)
      },
    })
  }

  /* =====================
     TRANSFERIR ATENDIMENTO (envia mensagem de transferência - tipo T - antes de transferir)
  ===================== */
  async function executarTransferirBase(chatId: string, setorDestino: Setor): Promise<boolean> {
    setTransferindo(true)
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/transferir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_setor: setorDestino.id_setor }),
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.message || "Não foi possível transferir o atendimento.")
        return false
      }

      setThreads((prev) =>
        sortThreads(
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  status: "P",
                  setorId: setorDestino.id_setor,
                  setorNome: setorDestino.no_setor,
                  atendenteNome: null,
                }
              : chat
          )
        )
      )
      return true
    } catch (err) {
      alert("Erro ao transferir atendimento. Tente novamente.")
      return false
    } finally {
      setTransferindo(false)
    }
  }

  async function transferirAtendimento(idSetorDestino: string) {
    if (!activeChat || transferindo || !idSetorDestino) return

    const setorDestino = setores.find((s) => s.id_setor === idSetorDestino)
    if (!setorDestino) return

    if (!confirm(`Transferir o atendimento de ${activeChat.contactName} para ${setorDestino.no_setor}?`)) return

    const chatId = activeChat.id
    const contactName = activeChat.contactName

    if (!autoEnviarPredefinida) {
      await executarTransferirBase(chatId, setorDestino)
      return
    }

    const opcoes = mensagensPorTipo("T")

    if (opcoes.length === 0) {
      await executarTransferirBase(chatId, setorDestino)
      return
    }

    if (opcoes.length === 1) {
      await enviarMensagemDireta(chatId, opcoes[0].ds_atalho)
      await executarTransferirBase(chatId, setorDestino)
      return
    }

    setSelecaoPredefinida({
      acao: "transferir",
      tipo: "T",
      opcoes,
      chatId,
      contactName,
      onConfirm: async (msg) => {
        setSelecaoPredefinida(null)
        if (msg) await enviarMensagemDireta(chatId, msg.ds_atalho)
        await executarTransferirBase(chatId, setorDestino)
      },
    })
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") sendMessage() },
    [reply, activeChat, idAtendenteAtivo, sending]
  )

  /* =====================
     RENDERIZAÇÃO DO CARD
  ===================== */
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
          <StatusBadge status={chat.status} />
        </div>
        <span className="text-zinc-400 font-medium">
          {chat.messages.at(-1)?.timestamp ? new Date(chat.messages.at(-1)!.timestamp).toLocaleTimeString().slice(0, 5) : ""}
        </span>
      </div>
    </div>
  )

  const atendimentoEmAndamento = activeChat?.status === "H" || activeChat?.status === "P"

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden text-zinc-800 font-sans">
      {/* HEADER BAR */}
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-3 bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-500">Atendendo como:</span>
          <select
            value={idAtendenteAtivo}
            onChange={(e) => trocarAtendenteAtivo(e.target.value)}
            className="border border-zinc-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-800"
          >
            <option value="">Selecione um atendente</option>
            {atendentes.map((a) => (
              <option key={a.id_atendente} value={a.id_atendente}>
                {a.no_atendente} {a.no_setor ? `· ${a.no_setor}` : ""}
              </option>
            ))}
          </select>

          {/* SWITCH: envio automático de mensagens predefinidas */}
          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-zinc-200">
            <span className="text-sm font-medium text-zinc-500 whitespace-nowrap">Auto-envio predefinidas</span>
            <button
              type="button"
              role="switch"
              aria-checked={autoEnviarPredefinida}
              onClick={alternarAutoEnvio}
              title={autoEnviarPredefinida ? "Desligar envio automático" : "Ligar envio automático"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                autoEnviarPredefinida ? "bg-emerald-600" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  autoEnviarPredefinida ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {pendentesCount > 0 && (
          <div className="flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            {pendentesCount} {pendentesCount > 1 ? "aguardando" : "aguardando"}
          </div>
        )}
      </header>

      {/* MAIN KANBAN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">

        {/* KANBAN BOARD (Esquerda) */}
          <div className="flex overflow-x-auto bg-zinc-50/50 border-r border-zinc-200 shadow-inner">

            {/* Coluna 1: Automatizado */}
            <div className={`flex flex-col border-r border-zinc-200 shrink-0 transition-[width] duration-200 ${collapsedColumns.automatizado ? "w-12" : "w-[300px]"}`}>
              <div className="p-3 bg-white border-b border-zinc-200 sticky top-0 z-10 flex items-center justify-between gap-2">
                {!collapsedColumns.automatizado && (
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Automatizado ({automatizados.length})
                  </span>
                )}
                <button
                  onClick={() => toggleColumn("automatizado")}
                  title={collapsedColumns.automatizado ? "Expandir" : "Recolher"}
                  className="ml-auto shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
                >
                  {collapsedColumns.automatizado ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
              </div>
              {!collapsedColumns.automatizado && (
                <div className="flex-1 overflow-y-auto pb-4">
                  {automatizados.map(renderChatCard)}
                </div>
              )}
            </div>

            {/* Coluna 2: Aguardando */}
            <div className={`flex flex-col border-r border-zinc-200 shrink-0 transition-[width] duration-200 ${collapsedColumns.aguardando ? "w-12" : "w-[300px]"}`}>
              <div className="p-3 bg-white border-b border-zinc-200 sticky top-0 z-10 flex items-center justify-between gap-2">
                {!collapsedColumns.aguardando && (
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                    Aguardando ({aguardando.length})
                    {aguardando.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />}
                  </span>
                )}
                <button
                  onClick={() => toggleColumn("aguardando")}
                  title={collapsedColumns.aguardando ? "Expandir" : "Recolher"}
                  className="ml-auto shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
                >
                  {collapsedColumns.aguardando ? (
                    aguardando.length > 0 ? (
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    ) : (
                      <ChevronRight size={14} />
                    )
                  ) : (
                    <ChevronLeft size={14} />
                  )}
                </button>
              </div>
              {!collapsedColumns.aguardando && (
                <div className="flex-1 overflow-y-auto pb-4">
                  {aguardando.map(renderChatCard)}
                </div>
              )}
            </div>

            {/* Coluna 3: Meus Atendimentos */}
            <div className={`flex flex-col shrink-0 transition-[width] duration-200 ${collapsedColumns.meus ? "w-12" : "w-[300px]"}`}>
              <div className="p-3 bg-white border-b border-zinc-200 sticky top-0 z-10 flex items-center justify-between gap-2">
                {!collapsedColumns.meus && (
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Meus Atendimentos ({meusAtendimentos.length})
                  </span>
                )}
                <button
                  onClick={() => toggleColumn("meus")}
                  title={collapsedColumns.meus ? "Expandir" : "Recolher"}
                  className="ml-auto shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
                >
                  {collapsedColumns.meus ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
              </div>
              {!collapsedColumns.meus && (
                <div className="flex-1 overflow-y-auto pb-4">
                  {meusAtendimentos.map(renderChatCard)}
                </div>
              )}
            </div>

          </div>

        {/* CHAT WINDOW (Direita) */}
        <main className="flex-1 flex flex-col bg-white min-w-[400px]">
          {activeChat ? (
            <>
              {/* Header do Chat */}
              <div className="border-b border-zinc-200 p-4 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <Avatar name={activeChat.contactName} photo={activeChat.photo} />
                  <div>
                    <div className="font-bold text-zinc-900 text-lg leading-tight">{activeChat.contactName}</div>
                    <div className="text-sm text-zinc-500 mb-1">
                      {activeChat.lastSeen ? `Visto por último ${new Date(activeChat.lastSeen).toLocaleString()}` : activeChat.contactNumber}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={activeChat.status} />
                      {activeChat.setorNome && <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">Setor: {activeChat.setorNome}</span>}
                      {activeChat.atendenteNome && <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">Resp: {activeChat.atendenteNome}</span>}
                      <PlatformBadge platform={activeChat.platform} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Transferir e Finalizar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) transferirAtendimento(e.target.value)
                      }}
                      disabled={!atendimentoEmAndamento || transferindo}
                      className="h-12 text-sm border border-zinc-300 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-800 disabled:opacity-50 disabled:bg-zinc-50 shrink-0 outline-none w-36"
                    >
                      <option value="">
                        {transferindo ? "Transferindo..." : "Transferir..."}
                      </option>
                      {setores.map((s) => (
                        <option key={s.id_setor} value={s.id_setor}>
                          {s.no_setor}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={finalizarAtendimento}
                      disabled={!atendimentoEmAndamento || finalizando}
                      className="h-12 text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 text-white px-4 rounded-lg transition-colors shrink-0"
                    >
                      {finalizando ? "Encerrando..." : "Finalizar"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagens do Chat */}
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

              {/* Input do Chat + Ações de atendimento */}
              <div className="border-t border-zinc-200 p-4 bg-white">
                {activeChat.status === "P" ? (
                  <button
                    onClick={iniciarAtendimento}
                    disabled={iniciandoAtendimento}
                    className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-4 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                  >
                    {iniciandoAtendimento ? "Iniciando atendimento..." : "Assumir / Iniciar Atendimento"}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    {/* CENTRO: Raio e Input (Ocupando espaço livre) */}
                    <div className="flex items-center gap-2 flex-1">
                      {/* Mensagens predefinidas */}
                      <div className="relative shrink-0 h-12" ref={predefinidasRef}>
                        <button
                          onClick={() => setMostrarPredefinidas((v) => !v)}
                          title="Mensagens predefinidas"
                          className="h-full aspect-square flex items-center justify-center border border-zinc-300 rounded-lg bg-white hover:bg-zinc-50 text-zinc-600 transition-colors px-3"
                        >
                          <Zap size={18} />
                        </button>

                        {mostrarPredefinidas && (
                          <div className="absolute bottom-full mb-2 left-0 w-72 max-h-64 overflow-y-auto bg-white border border-zinc-200 rounded-lg shadow-lg z-20">
                            {mensagensPredefinidas.length === 0 ? (
                              <div className="p-3 text-sm text-zinc-400 italic">
                                Nenhuma mensagem predefinida cadastrada.
                              </div>
                            ) : (
                              mensagensPredefinidas.map((m) => (
                                <button
                                  key={m.id_atalho}
                                  onClick={() => usarMensagemPredefinida(m)}
                                  className="block w-full text-left px-3 py-2 hover:bg-zinc-50 border-b border-zinc-100 last:border-b-0"
                                >
                                  <strong>{m.no_atalho}</strong>
                                  <br />
                                  <span className="text-sm text-zinc-500">
                                    {m.ds_atalho}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      <input
                        placeholder={idAtendenteAtivo ? "Escreva sua mensagem..." : "Selecione um atendente acima para responder..."}
                        className="h-12 border border-zinc-300 rounded-lg px-4 flex-1 disabled:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow w-full outline-none"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!idAtendenteAtivo || sending}
                      />
                    </div>

                    {/* DIREITA: Enviar */}
                    <button
                      onClick={sendMessage}
                      disabled={!idAtendenteAtivo || sending || !reply.trim()}
                      className="h-12 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold px-6 rounded-lg transition-colors flex items-center justify-center min-w-[120px] shrink-0"
                    >
                      {sending ? "Enviando..." : "Enviar"}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400 flex-col gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p>Selecione um atendimento ao lado para iniciar</p>
            </div>
          )}
        </main>

      </div>

      {/* MODAL: escolha de mensagem predefinida quando há 2+ opções do mesmo tipo */}
      {selecaoPredefinida && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
              <div>
                <h2 className="font-bold text-zinc-900 text-base">{ACAO_TITULO[selecaoPredefinida.acao]}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{selecaoPredefinida.contactName}</p>
              </div>
              <button
                onClick={() => setSelecaoPredefinida(null)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-zinc-600 mb-3">{ACAO_DESCRICAO[selecaoPredefinida.acao]}</p>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                {selecaoPredefinida.opcoes.map((op) => (
                  <button
                    key={op.id_atalho}
                    onClick={() => selecaoPredefinida.onConfirm(op)}
                    className="text-left border border-zinc-200 rounded-lg px-3 py-2 hover:border-zinc-800 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-semibold text-sm text-zinc-900">{op.no_atalho}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{op.ds_atalho}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-zinc-200 bg-zinc-50">
              <button
                onClick={() => setSelecaoPredefinida(null)}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-800 px-3 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={() => selecaoPredefinida.onConfirm(null)}
                className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-lg px-3 py-2 bg-white hover:bg-zinc-100"
              >
                Continuar sem enviar mensagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}