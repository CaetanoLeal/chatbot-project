//app/(dashboard)/dashboard/instances/components/ConnectInstanceModal.tsx
"use client"
import { useState } from "react"

type InstancePlatform = "whatsapp" | "telegram"

export default function ConnectInstanceModal({
  onClose,
}: {
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [funnel, setFunnel] = useState("")
  const [platform, setPlatform] = useState<InstancePlatform | "">("")
  const [telegramStep, setTelegramStep] = useState<"phone" | "code">("phone")

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow w-full max-w-lg p-6 space-y-4 text-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-800">
            Conectar instância
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Nome */}
        <div>
          <label className="text-sm font-medium">
            Nome da instância
          </label>
          <input
            className="border rounded px-3 py-2 w-full text-zinc-700"
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
            className="border rounded px-3 py-2 w-full text-zinc-700"
            value={funnel}
            onChange={(e) => setFunnel(e.target.value)}
          >
            <option value="">Selecione</option>
            <option>Funil WhatsApp</option>
            <option>Funil Telegram</option>
          </select>
        </div>

        {/* Plataforma */}
        <div>
          <label className="text-sm font-medium">
            Plataforma
          </label>
          <select
            className="border rounded px-3 py-2 w-full text-zinc-700"
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

        {/* WhatsApp */}
        {platform === "whatsapp" && (
          <div className="border rounded p-4 text-center text-zinc-600">
            <div className="w-40 h-40 bg-zinc-200 mx-auto mb-2 flex items-center justify-center text-zinc-500">
              QR CODE
            </div>
            Escaneie o QR Code no WhatsApp
          </div>
        )}

        {/* Telegram */}
        {platform === "telegram" && (
          <div className="space-y-3">
            {telegramStep === "phone" ? (
              <>
                <input
                  placeholder="Número do Telegram"
                  className="border rounded px-3 py-2 w-full text-zinc-700"
                />
                <button
                  onClick={() => setTelegramStep("code")}
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                >
                  Enviar código
                </button>
              </>
            ) : (
              <>
                <input
                  placeholder="Código recebido"
                  className="border rounded px-3 py-2 w-full text-zinc-700"
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
                  Confirmar código
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}