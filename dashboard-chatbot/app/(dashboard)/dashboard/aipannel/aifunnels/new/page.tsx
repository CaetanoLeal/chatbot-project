// app/(dashboard)/dashboard/iaFunnels/new/page.tsx
"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import {
  BrainCircuit,
  Loader2,
  ArrowLeft
} from "lucide-react"

import Link from "next/link"

interface ModeloIA {
  id_funil_ia_modelo: number
  ds_funil_ia_modelo: string
}

interface FunilIA {
  id_funil_ia: string
  no_funil: string
  no_agente: string
  ds_funil: string
  ds_personalidade: string
  nu_temperature: number
  nu_max_tokens: number
  is_ativo: boolean
  ds_fallback: string
  is_human_handoff: boolean
  id_funil_ia_modelo: number
}

export default function NewIAFunilPage() {

  const router = useRouter()

  const [saving, setSaving] = useState(false)

  const [modelos, setModelos] = useState<ModeloIA[]>([])

  const [form, setForm] = useState<FunilIA>({
      id_funil_ia: "",
      no_funil: "",
      no_agente: "",
      ds_funil: "",
      ds_personalidade: "",
      nu_temperature: 0.7,
      nu_max_tokens: 300,
      is_ativo: true,
      ds_fallback:
        "Desculpe, ocorreu um erro no atendimento.",
      is_human_handoff: false,
      id_funil_ia_modelo: 1
    })

  async function loadModelos() {

    try {

      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia-modelo`
        )

      const data = await response.json()

      if (Array.isArray(data)) {

        setModelos(data)

      } else if (Array.isArray(data.data)) {

        setModelos(data.data)

      } else {

        setModelos([])
      }

    } catch (err) {

      console.error(err)

      setModelos([])
    }
  }

  useEffect(() => {

    loadModelos()

  }, [])

  async function handleSubmit() {

    try {

      setSaving(true)

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/funil-ia`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      )

      router.push("/dashboard/iaFunnels")

    } catch (err) {

      console.error(err)

    } finally {

      setSaving(false)
    }
  }

  return (

    <div className="p-6 bg-zinc-100 h-screen overflow-y-auto">

      <div
        className="
          flex
          items-center
          justify-between
          mb-6
        "
      >

        <div>

          <Link
            href="/dashboard/iaFunnels"
            className="
              inline-flex
              items-center
              gap-2
              text-zinc-600
              hover:text-zinc-900
              mb-4
            "
          >
            <ArrowLeft className="w-4 h-4" />

            Voltar
          </Link>

          <h1
            className="
              text-3xl
              font-bold
              text-zinc-800
              flex
              items-center
              gap-2
            "
          >

            <BrainCircuit
              className="
                w-8
                h-8
                text-blue-600
              "
            />

            Novo Agente IA

          </h1>

          <p className="text-zinc-500 mt-1">
            Configure o comportamento
            da inteligência artificial.
          </p>

        </div>

      </div>

      <div
        className="
          bg-white
          rounded-3xl
          shadow-sm
          border
          border-zinc-200
          p-6
        "
      >

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
        >

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                mb-2
                text-zinc-700
              "
            >
              Nome do agente
            </label>

            <input
              value={form.no_agente}
              onChange={(e) =>
                setForm({
                  ...form,
                  no_agente: e.target.value
                })
              }
              className="
                w-full
                border
                border-zinc-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                text-zinc-800
              "
              placeholder="
                Ex: Atendente Financeiro
              "
            />

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                mb-2
                text-zinc-700
              "
            >
              Modelo IA
            </label>

            <select
              value={form.id_funil_ia_modelo}
              onChange={(e) =>
                setForm({
                  ...form,
                  id_funil_ia_modelo:
                    Number(e.target.value)
                })
              }
              className="
                w-full
                border
                border-zinc-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                text-zinc-800
              "
            >

              {
                modelos.map((modelo) => (

                  <option
                    key={
                      modelo.id_funil_ia_modelo
                    }
                    value={
                      modelo.id_funil_ia_modelo
                    }
                  >
                    {
                      modelo.ds_funil_ia_modelo
                    }
                  </option>

                ))
              }

            </select>

          </div>

          <div className="md:col-span-2">

            <label
              className="
                block
                text-sm
                font-medium
                mb-2
                text-zinc-700
              "
            >
              Descrição do funil
            </label>

            <input
              value={form.ds_funil}
              onChange={(e) =>
                setForm({
                  ...form,
                  ds_funil: e.target.value
                })
              }
              className="
                w-full
                border
                border-zinc-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                text-zinc-800
              "
              placeholder="
                Descreva o objetivo
                deste agente
              "
            />

          </div>

          <div className="md:col-span-2">

            <label
              className="
                block
                text-sm
                font-medium
                mb-2
                text-zinc-700
              "
            >
              Personalidade da IA
            </label>

            <textarea
              rows={8}
              value={form.ds_personalidade}
              onChange={(e) =>
                setForm({
                  ...form,
                  ds_personalidade:
                    e.target.value
                })
              }
              className="
                w-full
                border
                border-zinc-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                resize-none
                text-zinc-800
              "
              placeholder="
                Você é um atendente
                especializado em...
              "
            />

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                mb-2
                text-zinc-700
              "
            >
              Temperature
            </label>

            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={form.nu_temperature}
              onChange={(e) =>
                setForm({
                  ...form,
                  nu_temperature:
                    Number(e.target.value)
                })
              }
              className="
                w-full
                border
                border-zinc-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                text-zinc-800
              "
            />

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                mb-2
                text-zinc-700
              "
            >
              Max Tokens
            </label>

            <input
              type="number"
              min={50}
              max={500}
              value={form.nu_max_tokens}
              onChange={(e) =>
                setForm({
                  ...form,
                  nu_max_tokens:
                    Number(e.target.value)
                })
              }
              className="
                w-full
                border
                border-zinc-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                text-zinc-800
              "
            />

          </div>

          <div className="md:col-span-2">

            <label
              className="
                block
                text-sm
                font-medium
                mb-2
                text-zinc-700
              "
            >
              Mensagem fallback
            </label>

            <textarea
              rows={3}
              value={form.ds_fallback}
              onChange={(e) =>
                setForm({
                  ...form,
                  ds_fallback:
                    e.target.value
                })
              }
              className="
                w-full
                border
                border-zinc-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                resize-none
                text-zinc-800
              "
            />

          </div>

          <div
            className="
              flex
              items-center
              justify-between
              bg-zinc-100
              rounded-2xl
              p-4
            "
          >

            <div>

              <h3
                className="
                  font-semibold
                  text-zinc-800
                "
              >
                Agente ativo
              </h3>

              <p
                className="
                  text-sm
                  text-zinc-500
                "
              >
                Responde mensagens
                automaticamente.
              </p>

            </div>

            <input
              type="checkbox"
              checked={form.is_ativo}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_ativo:
                    e.target.checked
                })
              }
              className="w-5 h-5"
            />

          </div>

          <div
            className="
              flex
              items-center
              justify-between
              bg-zinc-100
              rounded-2xl
              p-4
            "
          >

            <div>

              <h3
                className="
                  font-semibold
                  text-zinc-800
                "
              >
                Handoff humano
              </h3>

              <p
                className="
                  text-sm
                  text-zinc-500
                "
              >
                Transfere atendimento
                para humano.
              </p>

            </div>

            <input
              type="checkbox"
              checked={form.is_human_handoff}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_human_handoff:
                    e.target.checked
                })
              }
              className="w-5 h-5"
            />

          </div>

        </div>

        <div
          className="
            flex
            items-center
            justify-end
            gap-3
            mt-8
          "
        >

          <Link
            href="/dashboard/iaFunnels"
            className="
              px-5
              py-3
              rounded-xl
              bg-zinc-100
              hover:bg-zinc-200
              transition
              text-zinc-700
            "
          >
            Cancelar
          </Link>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="
              bg-blue-600
              hover:bg-blue-700
              transition
              text-white
              px-6
              py-3
              rounded-xl
              flex
              items-center
              gap-2
              font-medium
              disabled:opacity-50
            "
          >

            {
              saving && (
                <Loader2
                  className="
                    animate-spin
                    w-4
                    h-4
                  "
                />
              )
            }

            Salvar agente

          </button>

        </div>

      </div>

    </div>
  )
}