//app/(dashboard)/dashboard/instances/components/ConnectInstanceModal.tsx
"use client"

import { io, Socket } from "socket.io-client"
import { useState, useEffect, useRef } from "react"

type InstancePlatform = "whatsapp" | "telegram"

export default function ConnectInstanceModal({
  onClose,
}: {
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [funnel, setFunnel] = useState("")
  const [platform, setPlatform] = useState<InstancePlatform | "">("")
  const [funis, setFunis] = useState<any[]>([])
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const socketRef = useRef<Socket | null>(null)

  /* =====================================================
     CARREGAR FUNIS
  ===================================================== */
  useEffect(() => {
    async function loadFunis() {
      try {
        const res = await fetch("http://localhost:3001/api/funis")
        const data = await res.json()

        if (Array.isArray(data)) {
          setFunis(data)
        } else if (data.success && data.data) {
          setFunis(data.data)
        }
      } catch (err) {
        console.error("Erro ao carregar funis", err)
      }
    }

    loadFunis()
  }, [])

  /* =====================================================
     SOCKET.IO (CRIADO UMA ÚNICA VEZ)
  ===================================================== */
  useEffect(() => {
    const socket = io("http://localhost:3000")

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("🟢 Conectado ao backend")
    })

    socket.on("INSTANCE_QR", (data) => {
      console.log("📲 QR recebido:", data)

      // só atualiza se for a instância atual
      if (data?.nome === nameRef.current) {
        setQrCode(data.qrCode)
        setStatus("Escaneie o QR Code")
      }
    })

    socket.on("INSTANCE_CONNECTED", (data) => {
      if (data?.nome === nameRef.current) {
        setStatus("Conectado ✅")
        setQrCode(null)
      }
    })

    socket.on("INSTANCE_DISCONNECTED", (data) => {
      if (data?.nome === nameRef.current) {
        setStatus("Desconectado ❌")
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const nameRef = useRef(name)

    useEffect(() => {
    nameRef.current = name
    }, [name])

  /* =====================================================
     CRIAR INSTÂNCIA
  ===================================================== */
  const handleCreateInstance = async () => {
    if (!name || !funnel || !platform) {
      alert("Preencha todos os campos")
      return
    }

    setLoading(true)
    setQrCode(null)
    setStatus("Criando instância...")

    try {
      const res = await fetch("http://localhost:3000/instances/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          webhookUrl: "http://api_mensagem:3001/webhook",
          id_funil: funnel,
          platform,
        }),
      })

      const data = await res.json()

      if (data.status) {
        setStatus("Aguardando QR...")

        // 🔥 Fallback: busca QR via HTTP após 2 segundos
        setTimeout(async () => {
          try {
            const qrRes = await fetch(
              `http://localhost:3000/instances/${name}/qrcode`
            )
            const qrData = await qrRes.json()

            if (qrData?.qrCode) {
              setQrCode(qrData.qrCode)
              setStatus("Escaneie o QR Code")
            }
          } catch (err) {
            console.error("Erro ao buscar QR via HTTP", err)
          }
        }, 2000)
      }
    } catch (err) {
      console.error(err)
      setStatus("Erro ao criar instância")
    } finally {
      setLoading(false)
    }
  }

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow w-full max-w-lg p-6 space-y-4 text-zinc-700">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-800">
            Conectar instância
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Nome */}
        <div>
          <label className="text-sm font-medium">
            Nome da instância
          </label>
          <input
            className="border rounded px-3 py-2 w-full text-black bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Funil */}
        <div>
          <label className="text-sm font-medium">
            Funil
          </label>
          <select
            className="border rounded px-3 py-2 w-full text-black bg-white"
            value={funnel}
            onChange={(e) => setFunnel(e.target.value)}
          >
            <option value="">Selecione</option>
            {funis.map((funil) => (
              <option key={funil.id} value={funil.id}>
                {funil.name}
              </option>
            ))}
          </select>
        </div>

        {/* Plataforma */}
        <div>
          <label className="text-sm font-medium">
            Plataforma
          </label>
          <select
            className="border rounded px-3 py-2 w-full text-black bg-white"
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value as InstancePlatform)
            }
          >
            <option value="">Selecione</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>

        {/* Botão criar */}
        <button
          onClick={handleCreateInstance}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Conectando..." : "Conectar"}
        </button>

        {/* QR WhatsApp */}
        {platform === "whatsapp" && qrCode && (
          <div className="border rounded p-4 text-center">
            <img src={qrCode} className="mx-auto" alt="QR Code" />
            <p className="mt-2 text-sm text-zinc-600">
              {status}
            </p>
          </div>
        )}

        {!qrCode && status && (
          <p className="text-center text-sm text-zinc-600">
            {status}
          </p>
        )}
      </div>
    </div>
  )
}