//app/cadastro/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();

  const [noUsuario, setNoUsuario] = useState("");
  const [gnEmail, setGnEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const response = await fetch(`${apiUrl}/api/usuarios/cadastrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          no_usuario: noUsuario,
          gn_email: gnEmail,
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao realizar cadastro.");
      }

      setSucesso("Conta criada com sucesso! Redirecionando para o login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="w-full max-w-sm bg-white p-8 shadow-sm border border-gray-200 rounded-md">
        <h1 className="text-2xl font-semibold mb-6 text-center tracking-tight">
          Criar Nova Conta
        </h1>

        {erro && (
          <div className="mb-6 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-6 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label htmlFor="no_usuario" className="block text-sm font-medium mb-1 text-gray-700">
              Nome de Usuário
            </label>
            <input
              id="no_usuario"
              type="text"
              value={noUsuario}
              onChange={(e) => setNoUsuario(e.target.value)}
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors rounded-sm bg-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="gn_email" className="block text-sm font-medium mb-1 text-gray-700">
              E-mail
            </label>
            <input
              id="gn_email"
              type="email"
              value={gnEmail}
              onChange={(e) => setGnEmail(e.target.value)}
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors rounded-sm bg-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium mb-1 text-gray-700">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors rounded-sm bg-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium mb-1 text-gray-700">
              Confirmar Senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors rounded-sm bg-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-medium py-2.5 px-4 text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors rounded-sm mt-2"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}