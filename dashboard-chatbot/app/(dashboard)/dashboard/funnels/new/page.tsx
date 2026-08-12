//app/(dashboard)/dashboard/funnels/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Draft = { name: string; description: string };

export default function NewFunnelPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const id_funil = crypto.randomUUID();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/funis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_funil, name: "", description: "" }),
      });

      if (!response.ok) throw new Error("Erro ao criar o funil");

      const data = await response.json();

      router.push(`/dashboard/funnels/${data.id_funil}`);
    } catch (error) {
      console.error("Erro ao criar funil:", error);
      alert("Ocorreu um erro ao criar o funil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-700">Criar Novo Funil</h1>
        <button onClick={() => router.back()} className="text-sm text-zinc-500 hover:underline">
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Funil</label>
          <input
            type="text"
            required
            placeholder="Ex: Funil de Vendas - Black Friday"
            className="w-full border border-zinc-300 rounded px-3 py-2 outline-none focus:border-blue-500 placeholder:text-zinc-400 text-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            placeholder="Breve descrição do objetivo deste funil..."
            className="w-full border border-zinc-300 rounded px-3 py-2 outline-none focus:border-blue-500 placeholder:text-zinc-400 min-h-[100px] text-zinc-700"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Criando..." : "Criar e editar fluxo"}
          </button>
        </div>
      </form>
    </div>
  );
}