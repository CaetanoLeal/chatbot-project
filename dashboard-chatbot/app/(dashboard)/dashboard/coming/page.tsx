//app/(dashboard)/dashboard/coming/page.tsx
"use client"

import Link from "next/link"

export default function coming() {
  return (
    <div className="h-full flex items-center justify-center bg-zinc-100">
      <div className="bg-white rounded-lg shadow p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🚧</div>

        <h1 className="text-2xl font-bold text-zinc-800 mb-2">
          Em breve
        </h1>

        <p className="text-zinc-500 mb-6">
          Estamos trabalhando nesta funcionalidade.
          Em breve ela estará disponível no sistema.
        </p>

        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </div>
  )
}