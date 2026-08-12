//app/dashboard-chatbot/app/(dashboard)/dashboard/aipannel/aifunnels/new/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import IAFunilForm, { FunilIA, ModeloIA } from "../components/IAFunilForm"

const emptyFunil: FunilIA = {
  no_funil: "",
  no_agente: "",
  ds_funil: "",
  ds_personalidade: "",
  nu_temperature: 0.7,
  nu_max_tokens: 300,
  is_ativo: true,
  ds_fallback: "Desculpe, ocorreu um erro no atendimento.",
  is_human_handoff: false,
  id_funil_ia_modelo: 1,
  id_setor:"",
  id_funil: "",
}

export default function NewIAFunilPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelos, setModelos] = useState<ModeloIA[]>([])

  useEffect(() => {
    async function loadModelos() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia-modelo`)
        const data = await response.json()
        if (Array.isArray(data)) setModelos(data)
        else if (data.data) setModelos(data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadModelos()
  }, [])

  async function handleCreate(data: FunilIA, clearDraft: () => void) {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Erro ao criar funil IA.")
      }

      clearDraft()
      router.push("/dashboard/aipannel/aifunnels")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    )
  }

  return (
    <IAFunilForm onCancel={() => router.push("/dashboard/aipannel/aifunnels")} onSuccess={() => router.push("/dashboard/aipannel/aifunnels")} />
  )
}