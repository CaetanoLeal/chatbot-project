//app/dashboard-chatbot/app/(dashboard)/dashboard/aipannel/aifunnels/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import IAFunilForm, { FunilIA, ModeloIA } from "../components/IAFunilForm"

export default function EditIAFunilPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)  // <-- adicionado
  const [modelos, setModelos] = useState<ModeloIA[]>([])
  const [initialData, setInitialData] = useState<FunilIA | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const [resModelos, resFunil] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia-modelo`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia/${id}`)
        ])

        const dataModelos = await resModelos.json()
        const dataFunil = await resFunil.json()

        if (Array.isArray(dataModelos)) setModelos(dataModelos)
        else if (dataModelos.data) setModelos(dataModelos.data)

        if (dataFunil) setInitialData(dataFunil)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id])

  async function handleUpdate(data: FunilIA, clearDraft: () => void) {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Erro ao atualizar funil IA.")
      }

      clearDraft()
      router.push("/dashboard/aipannel/aifunnels")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !initialData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    )
  }

  return (
    <IAFunilForm
      idFunilIa={id}
      onCancel={() => router.push("/dashboard/aipannel/aifunnels")}
      onSuccess={() => router.push("/dashboard/aipannel/aifunnels")}
    />
  )
}