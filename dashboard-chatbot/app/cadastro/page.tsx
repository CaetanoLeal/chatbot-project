//app/cadastro/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// MESMO BACKGROUND DA TELA DE LOGIN (grade fina + cross), sem os nós/edges.
// Se você mudar CROSS_OFFSET_X/Y no login pra alinhar as cruzes, replique
// os mesmos valores aqui pra manter as duas telas consistentes.
// ─────────────────────────────────────────────────────────────────────────────

const CROSS_OFFSET_X = 12.5;
const CROSS_OFFSET_Y = 12.5;

function GridBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e9f0f7 1px, transparent 1px),
            linear-gradient(to bottom, #e9f0f7 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0.5 }}
      >
        <defs>
          <pattern
            id="rf-cross-cadastro"
            width={120}
            height={120}
            patternUnits="userSpaceOnUse"
            x={CROSS_OFFSET_X}
            y={CROSS_OFFSET_Y}
          >
            <path
              d="M60,54 L60,66 M54,60 L66,60"
              stroke="#006aff6e"
              strokeWidth={1.5}
              strokeLinecap="square"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rf-cross-cadastro)" />
      </svg>
    </>
  );
}

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      <GridBackground />

      {/* Card Central de Cadastro */}
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-3xl border border-zinc-200/90 bg-white/95 p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300">
        <div className="mb-6 text-center">
          <div className="skeuo-black-badge mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-2xl text-white">
            <UserPlus className="h-6 w-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
            Criar Nova Conta
          </h1>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            Cadastre-se para acessar seus chatbots
          </p>
        </div>

        {erro && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label
              htmlFor="no_usuario"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-600"
            >
              Nome de Usuário
            </label>
            <input
              id="no_usuario"
              type="text"
              value={noUsuario}
              onChange={(e) => setNoUsuario(e.target.value)}
              className="w-full rounded-xl border border-zinc-300/80 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 shadow-inner transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label
              htmlFor="gn_email"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-600"
            >
              E-mail
            </label>
            <input
              id="gn_email"
              type="email"
              value={gnEmail}
              onChange={(e) => setGnEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-300/80 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 shadow-inner transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-600"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-xl border border-zinc-300/80 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 shadow-inner transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-600"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full rounded-xl border border-zinc-300/80 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 shadow-inner transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-900/10"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="skeuo-black-button mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
            Entrar
          </Link>
        </div>
      </div>

      {/* Mesmos tokens de skeuomorphism preto/branco/cinza usados no login */}
      <style jsx global>{`
        .skeuo-black-button {
          background: linear-gradient(180deg, #27272a 0%, #18181b 50%, #09090b 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow:
            0 10px 20px -5px rgba(0, 0, 0, 0.4),
            0 2px 4px -1px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
        }

        .skeuo-black-button:hover {
          background: linear-gradient(180deg, #3f3f46 0%, #27272a 50%, #09090b 100%);
          box-shadow:
            0 14px 24px -6px rgba(0, 0, 0, 0.5),
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.25);
        }

        .skeuo-black-button:active {
          transform: translateY(1px);
          box-shadow:
            0 4px 10px -2px rgba(0, 0, 0, 0.5),
            inset 0 2px 4px 0 rgba(0, 0, 0, 0.4);
        }

        .skeuo-black-badge {
          background: linear-gradient(180deg, #27272a 0%, #09090b 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow:
            0 8px 16px -4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </main>
  );
}