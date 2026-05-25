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

  // 🔥 TELEGRAM STATES
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"idle" | "code">("idle")

  const socketRef = useRef<Socket | null>(null)

  /* =====================================================
     CARREGAR FUNIS
  ===================================================== */
  useEffect(() => {
    async function loadFunis() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funis`)
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
     SOCKET.IO
  ===================================================== */
  useEffect(() => {
    const socket = io("http://localhost:3000")

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("🟢 Conectado ao backend")
    })

    socket.on("INSTANCE_QR", (data) => {
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
     CRIAR INSTÂNCIA / TELEGRAM LOGIN
  ===================================================== */
  const handleCreateInstance = async () => {
    if (!name || !funnel || !platform) {
      alert("Preencha todos os campos")
      return
    }

    // ================= TELEGRAM =================
    if (platform === "telegram") {
      if (!phone) {
        alert("Informe o telefone com DDI")
        return
      }

      setLoading(true)
      setStatus("Enviando código...")

      try {
        const res = await fetch("http://localhost:3002/iniciar-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: name,
            webhook: "http://api_mensagem:3001/webhook",
            phoneNumber: phone,
          }),
        })

        const data = await res.json()

        if (data.status === "aguardando_codigo") {
          setStep("code")
          setStatus("Digite o código enviado no Telegram")
        }
      } catch (err) {
        console.error(err)
        setStatus("Erro ao iniciar login")
      } finally {
        setLoading(false)
      }

      return
    }

    // ================= WHATSAPP =================
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
            console.error("Erro ao buscar QR", err)
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
     CONFIRMAR CÓDIGO TELEGRAM
  ===================================================== */
  const handleConfirmCode = async () => {
    if (!code) {
      alert("Digite o código")
      return
    }

    setLoading(true)
    setStatus("Confirmando código...")

    try {
      const res = await fetch("http://localhost:3002/confirmar-codigo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phone,
          phoneCode: code,
        }),
      })

      const data = await res.json()

      if (data.status?.includes("conectado")) {
        setStatus("Conectado ✅")
        setStep("idle")
      }
    } catch (err) {
      console.error(err)
      setStatus("Erro ao confirmar código")
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
            onChange={(e) => {
              setPlatform(e.target.value as InstancePlatform)
              setStep("idle")
              setStatus("")
              setQrCode(null)
            }}
          >
            <option value="">Selecione</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>

        {/* TELEGRAM - TELEFONE */}
        {platform === "telegram" && step === "idle" && (
          <div>
            <label className="text-sm font-medium">
              Telefone (com DDI)
            </label>
            <input
              placeholder="+5591999999999"
              className="border rounded px-3 py-2 w-full text-black bg-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}

        {/* TELEGRAM - CÓDIGO */}
        {platform === "telegram" && step === "code" && (
          <div>
            <label className="text-sm font-medium">
              Código do Telegram
            </label>
            <input
              className="border rounded px-3 py-2 w-full text-black bg-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              onClick={handleConfirmCode}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2"
            >
              Confirmar código
            </button>
          </div>
        )}

        {/* Botão principal */}
        {platform !== "telegram" || step === "idle" ? (
          <button
            onClick={handleCreateInstance}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Conectando..." : "Conectar"}
          </button>
        ) : null}

        {/* QR WhatsApp */}
        {platform === "whatsapp" && qrCode && (
          <div className="border rounded p-4 text-center">
            <img src={qrCode} className="mx-auto" alt="QR Code" />
            <p className="mt-2 text-sm text-zinc-600">
              {status}
            </p>
          </div>
        )}

        {/* STATUS */}
        {!qrCode && status && (
          <p className="text-center text-sm text-zinc-600">
            {status}
          </p>
        )}
      </div>
    </div>
  )
}