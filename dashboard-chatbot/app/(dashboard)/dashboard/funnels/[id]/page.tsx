//app/(dashboard)/dashboard/funnels/[id]/page.tsx
"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import FunnelForm from "../components/FunnelForm"

export default function EditFunnelPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function carregar() {
      const res = await fetch(`http://localhost:3001/api/funis/${id}`)
      const json = await res.json()
      setData(json)
    }

    carregar()
  }, [id])

  if (!data) {
    return <div className="p-6">Carregando funil...</div>
  }

  return <FunnelForm mode="edit" initialData={data} />
}