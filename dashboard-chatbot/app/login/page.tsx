//app/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  
  const [loginInput, setLoginInput] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('URL: ' + apiUrl)

      const response = await fetch(`${apiUrl}/api/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login: loginInput, senha, lembrar }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Falha na autenticação.");
      }

      // Armazena o token gerado (nu_sessao)
      // Se "lembrar" for marcado, vai para o localStorage (persistente), 
      // caso contrário, sessionStorage (fechou a aba, desloga).
        if (lembrar) {
        // max-age em segundos (30 dias)
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`;
        } else {
        // Sem max-age, atua como um cookie de sessão (morre ao fechar a aba/navegador)
        document.cookie = `token=${data.token}; path=/; SameSite=Strict`;
        }

      // Opcional: Salvar os dados básicos do usuário (no_usuario, gn_email)
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Redireciona para o sistema de atendimento
      router.push("/dashboard");
      
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
          Acessar seus chatbots
        </h1>

        {erro && (
          <div className="mb-6 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="login" className="block text-sm font-medium mb-1 text-gray-700">
              Usuário ou E-mail
            </label>
            <input
              id="login"
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
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

          <div className="flex items-center">
            <input
              id="lembrar"
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
              className="h-4 w-4 border-gray-300 rounded-sm text-black focus:ring-black accent-black cursor-pointer"
            />
            <label htmlFor="lembrar" className="ml-2 text-sm text-gray-600 cursor-pointer">
              Lembrar de mim
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-medium py-2.5 px-4 text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors rounded-sm mt-2"
          >
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
        Ainda não tem uma conta?{" "}
            <Link href="/cadastro" className="text-black font-medium hover:underline">
                Criar conta
            </Link>
        </div>
      </div>
    </main>
  );
}