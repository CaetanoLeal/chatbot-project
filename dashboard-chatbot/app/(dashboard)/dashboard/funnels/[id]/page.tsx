"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import FunnelForm from "../components/FunnelForm"

export default function EditFunnelPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`http://localhost:3001/api/funis/${id}`)

        if (!res.ok) {
          throw new Error("Erro ao buscar funil")
        }

        const json = await res.json()
        console.log("FUNIL RECEBIDO:", json)

        setData(json)
      } catch (err) {
        console.error(err)
      }
    }

    if (id) carregar()
  }, [id])

  if (!data) {
    return <div className="p-6">Carregando funil...</div>
  }

  return <FunnelForm mode="edit" initialData={data} />
}