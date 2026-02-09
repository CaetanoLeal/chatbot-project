"use client"

import { useState } from "react"
import ConnectInstanceModal from "./components/ConnectInstanceModal"

type InstancePlatform = "whatsapp" | "telegram"

type Instance = {
  id: string
  name: string
  number: string
  platforms: InstancePlatform[]
  funnel: string
}

function PlatformBadge({ platform }: { platform: InstancePlatform }) {
  if (platform === "whatsapp") {
    return (
      <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
        <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]">
          W
        </span>
        WhatsApp
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
        T
      </span>
      Telegram
    </span>
  )
}

export default function InstancesPage() {
  const [instances] = useState<Instance[]>([
    {
      id: "1",
      name: "Atendimento Principal",
      number: "+55 91 99999-9999",
      platforms: ["whatsapp"],
      funnel: "Funil WhatsApp",
    },
    {
      id: "2",
      name: "Vendas Telegram",
      number: "@meu_bot",
      platforms: ["telegram"],
      funnel: "Funil Telegram",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="p-6 space-y-6 text-zinc-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-800">
          Instâncias
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Conectar instância
        </button>
      </div>

      {/* Grid */}
      {instances.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-zinc-500">
          Nenhuma instância conectada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {instances.map((instance) => (
            <div
              key={instance.id}
              className="bg-white rounded shadow p-4 flex gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-sm">
                IMG
              </div>

              <div className="flex-1 space-y-1">
                <div className="font-semibold text-zinc-800">
                  {instance.name}
                </div>

                <div className="text-sm text-zinc-600">
                  {instance.number}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {instance.platforms.map((platform) => (
                    <PlatformBadge
                      key={platform}
                      platform={platform}
                    />
                  ))}

                  <span className="bg-zinc-100 text-zinc-700 text-xs px-2 py-1 rounded">
                    {instance.funnel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ConnectInstanceModal
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}