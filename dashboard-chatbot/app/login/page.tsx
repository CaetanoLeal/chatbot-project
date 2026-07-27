"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  ShieldCheck,
  Headset,
  MessageSquare,
  Bot,
  LucideIcon,
  Boxes,
  Workflow,
  LayoutDashboard,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DOS NÓS 3D SIMÉTRICOS (3 ESQUERDA · 3 DIREITA)
// ─────────────────────────────────────────────────────────────────────────────

const VB_W = 1200;
const VB_H = 680;
const CENTER_Y = 340;
const BOX_LEFT_X = 390;
const BOX_RIGHT_X = 810;

const LEFT_JOINT = { x: 260, y: CENTER_Y };
const RIGHT_JOINT = { x: 940, y: CENTER_Y };

interface NodeItem {
  id: string;
  Icon: LucideIcon;
  label: string;
  sublabel: string;
  description: string;
  x: number;
  y: number;
  floatDelay: string;
}

// 3 Nós à Esquerda (Entradas / Segurança)
const leftNodes: NodeItem[] = [
  {
    id: "user",
    Icon: LayoutDashboard,
    label: "Dashboards",
    sublabel: "Saíba de tudo",
    description: "Acompanhe o desempenho e as métricas dos seus bots, das suas ias e dos seus atendentes.",
    x: 120,
    y: 160,
    floatDelay: "0s",
  },
  {
    id: "senha",
    Icon: Workflow,
    label: "Fluxogramas",
    sublabel: "Crie seus bots",
    description: "Crie seus bots facilmente através de fluxograma.",
    x: 80,
    y: CENTER_Y,
    floatDelay: "1.2s",
  },
  {
    id: "verificacao",
    Icon: Boxes,
    label: "Instâncias",
    sublabel: "Multi-plataforma",
    description: "Você define infinitas instância de plataformas diferentes no sistema de acordo com a sua necessidade",
    x: 120,
    y: 520,
    floatDelay: "0.6s",
  },
];

// 3 Nós à Direita (Saídas / Recursos Liberados) - Totalmente Simétricos aos da Esquerda!
const rightNodes: NodeItem[] = [
  {
    id: "atendimento",
    Icon: Headset,
    label: "Atendimentos",
    sublabel: "atendimento facilitado",
    description: "Painel de controle e distribuição de chamados em tempo real.",
    x: 1080,
    y: 160,
    floatDelay: "0.4s",
  },
  {
    id: "mensagens",
    Icon: MessageSquare,
    label: "Mensagens",
    sublabel: "Omnichannel",
    description: "Central de disparos, histórico de conversas e chats integrados. Facilitando o atendimento humanizado",
    x: 1120,
    y: CENTER_Y,
    floatDelay: "1.8s",
  },
  {
    id: "bots",
    Icon: Bot,
    label: "Bots & IA",
    sublabel: "atendimento automático",
    description: "Assistentes virtuais inteligentes e respostas automáticas do seu jeito.",
    x: 1080,
    y: 520,
    floatDelay: "1.0s",
  },
];

function pct(value: number, axis: "x" | "y") {
  return `${(value / (axis === "x" ? VB_W : VB_H)) * 100}%`;
}

function bezier(from: { x: number; y: number }, to: { x: number; y: number }) {
  const midX = (from.x + to.x) / 2;
  return `M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE DO NÓ 3D COM EFEITO MAGNÉTICO E TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────

function Clay3DNode({
  Icon,
  label,
  sublabel,
  description,
  x,
  y,
  floatDelay,
  mousePos,
  containerRef,
  side, // "left" | "right"
}: NodeItem & {
  mousePos: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  side: "left" | "right";
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0, scale: 1 });

  // Cálculo da distância do mouse para efeito magnético / atração
  useEffect(() => {
    if (!containerRef.current || !nodeRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const nodePxX = (x / VB_W) * rect.width;
    const nodePxY = (y / VB_H) * rect.height;

    const dx = mousePos.x - nodePxX;
    const dy = mousePos.y - nodePxY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const maxRadius = 140; // Raio de aproximação do mouse

    if (dist < maxRadius) {
      const pullFactor = (1 - dist / maxRadius) * 12; // Deslocamento de atração
      const scaleBoost = 1 + (1 - dist / maxRadius) * 0.12; // Cresce até +12%
      setMagneticOffset({
        x: (dx / dist) * pullFactor,
        y: (dy / dist) * pullFactor,
        scale: scaleBoost,
      });
    } else {
      setMagneticOffset({ x: 0, y: 0, scale: 1 });
    }
  }, [mousePos, x, y, containerRef]);

  const anchorX = side === "left" ? "-100%" : "0%";

  return (
    <div
      ref={nodeRef}
      className="absolute flex flex-col items-center gap-2 transition-transform duration-150 ease-out z-20 hover:z-40"
      style={{
        left: pct(x, "x"),
        top: pct(y, "y"),
        transform: `translate(calc(${anchorX} + ${magneticOffset.x}px), calc(-50% + ${magneticOffset.y}px)) scale(${magneticOffset.scale})`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="clay-node group relative flex min-h-[74px] w-max max-w-[260px] cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200/90 bg-white/95 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-zinc-900 hover:shadow-2xl"
        style={{ animationDelay: floatDelay }}
      >
        {/* Cápsula de Ícone em Preto/Skeuomorphic */}
        <div className="clay-icon-capsule flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800 to-black text-white shadow-md transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5 stroke-[1.75]" />
        </div>

        {/* Labels do nó */}
        <div className="flex flex-col overflow-hidden text-left">
          <span className="truncate text-xs font-bold tracking-tight text-zinc-800 group-hover:text-black">
            {label}
          </span>
          <span className="truncate text-[10px] font-medium text-zinc-400">
            {sublabel}
          </span>
        </div>

        {/* Ponto indicador de estado */}
        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-zinc-900 p-[1px] shadow-sm">
          <div className="h-full w-full rounded-full bg-white opacity-80 animate-pulse" />
        </div>

        {/* Tooltip Informativo no Hover */}
        {isHovered && (
          <div className="pointer-events-none absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-48 rounded-xl border border-zinc-200 bg-zinc-900/95 p-2.5 text-center text-white shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <p className="text-[11px] font-semibold text-zinc-100">{label}</p>
            <p className="mt-0.5 text-[10px] text-zinc-400 leading-snug">
              {description}
            </p>
            {/* Setinha do Tooltip */}
            <div className="absolute top-full left-1/2 -ml-1.5 border-4 border-transparent border-t-zinc-900" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS SVG COM ANIMAÇÃO CORRIGIDA EM TODAS AS LINHAS (INCLUSIVO SENHA)
// ─────────────────────────────────────────────────────────────────────────────

function Nodes3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 hidden xl:block overflow-hidden"
    >
      <div className="relative mx-auto h-full max-w-[1200px]">
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            {/* Gradientes e Glow Monocromáticos */}
            <linearGradient id="gradient-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#18181B" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#09090B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#18181B" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Troncos Retos de Ligação ao Formulario de Login */}
          <path
            d={`M${LEFT_JOINT.x},${LEFT_JOINT.y} L${BOX_LEFT_X},${CENTER_Y}`}
            stroke="#E4E4E7"
            strokeWidth={2}
          />
          <path
            d={`M${LEFT_JOINT.x},${LEFT_JOINT.y} L${BOX_LEFT_X},${CENTER_Y}`}
            stroke="#18181B"
            strokeWidth={2}
            strokeDasharray="8 12"
            className="animate-flow-left"
          />

          <path
            d={`M${BOX_RIGHT_X},${CENTER_Y} L${RIGHT_JOINT.x},${RIGHT_JOINT.y}`}
            stroke="#E4E4E7"
            strokeWidth={2}
          />
          <path
            d={`M${BOX_RIGHT_X},${CENTER_Y} L${RIGHT_JOINT.x},${RIGHT_JOINT.y}`}
            stroke="#18181B"
            strokeWidth={2}
            strokeDasharray="8 12"
            className="animate-flow-right"
          />

          {/* Conexões dos 3 Nós da Esquerda */}
          {leftNodes.map((n, i) => {
            const pathD = bezier(LEFT_JOINT, { x: n.x, y: n.y });
            return (
              <g key={`l-path-${i}`}>
                <path d={pathD} stroke="#E4E4E7" strokeWidth={2} />
                <path
                  d={pathD}
                  stroke="#18181B"
                  strokeWidth={2.5}
                  strokeDasharray="8 12"
                  className="animate-flow-left"
                />
              </g>
            );
          })}

          {/* Conexões dos 3 Nós da Direita */}
          {rightNodes.map((n, i) => {
            const pathD = bezier(RIGHT_JOINT, { x: n.x, y: n.y });
            return (
              <g key={`r-path-${i}`}>
                <path d={pathD} stroke="#E4E4E7" strokeWidth={2} />
                <path
                  d={pathD}
                  stroke="#18181B"
                  strokeWidth={2.5}
                  strokeDasharray="8 12"
                  className="animate-flow-right"
                />
              </g>
            );
          })}

          {/* Pontos de Junção Pretos & Brancos */}
          <circle cx={LEFT_JOINT.x} cy={LEFT_JOINT.y} r={6} fill="#09090B" />
          <circle cx={LEFT_JOINT.x} cy={LEFT_JOINT.y} r={2.5} fill="#FFFFFF" />

          <circle cx={RIGHT_JOINT.x} cy={RIGHT_JOINT.y} r={6} fill="#09090B" />
          <circle cx={RIGHT_JOINT.x} cy={RIGHT_JOINT.y} r={2.5} fill="#FFFFFF" />
        </svg>

        {/* Renderização dos Nós 3D */}
        {leftNodes.map((n) => (
          <Clay3DNode key={n.id} {...n} side="left" mousePos={mousePos} containerRef={containerRef} />
        ))}
        {rightNodes.map((n) => (
          <Clay3DNode key={n.id} {...n} side="right" mousePos={mousePos} containerRef={containerRef} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA DE LOGIN COM CARD CENTRAL SKEUOMORPHIC EM PRETO/BRANCO/CINZA
// ─────────────────────────────────────────────────────────────────────────────

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
      console.log("URL: " + apiUrl);

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

      if (lembrar) {
        document.cookie = `token=${data.token}; path=/; max-age=${
          60 * 60 * 24 * 30
        }; SameSite=Strict`;
      } else {
        document.cookie = `token=${data.token}; path=/; SameSite=Strict`;
      }

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      router.push("/dashboard");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      {/* Background Matrix de Pontos */}
      <>
      {/* equivalente ao Background "minor" (Lines, gap=24) */}
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

      {/* equivalente ao Background "major" (Cross, gap=120, size=12) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ opacity: 0.5 }}
          >
            <defs>
              <pattern
                id="rf-cross"
                width={120}
                height={120}
                patternUnits="userSpaceOnUse"
                x={12.5}
                y={12.5}
              >
                <path
                  d="M60,54 L60,66 M54,60 L66,60"
                  stroke="#006aff6e"
                  strokeWidth={1.5}
                  strokeLinecap="square"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rf-cross)" />
          </svg>
        </>

      {/* Componente 3D Canvas Interativo */}
      <Nodes3DCanvas />

      {/* Card Central de Login */}
      <div className="relative z-30 mx-4 w-full max-w-sm rounded-3xl border border-zinc-200/90 bg-white/95 p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300">
        
        {/* Encaixes visuais skeuomorphic nas bordas do card */}
        <div className="absolute top-1/2 -left-3 hidden -translate-y-1/2 xl:flex h-6 w-3 items-center justify-center rounded-r-md bg-zinc-900 shadow-sm border-r border-y border-zinc-700/50">
          <div className="h-2 w-1 rounded-full bg-white animate-pulse" />
        </div>
        <div className="absolute top-1/2 -right-3 hidden -translate-y-1/2 xl:flex h-6 w-3 items-center justify-center rounded-l-md bg-zinc-900 shadow-sm border-l border-y border-zinc-700/50">
          <div className="h-2 w-1 rounded-full bg-white animate-pulse" />
        </div>

        <div className="mb-6 text-center">
          {/* Ícone com Skeuomorphism 3D em Preto Mineral */}
          <div className="skeuo-black-badge mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-2xl text-white">
            <Lock className="h-6 w-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
            Acessar Conta
          </h1>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            Conecte-se para autenticar seu acesso ao painel
          </p>
        </div>

        {erro && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="login"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-600"
            >
              Usuário ou E-mail
            </label>
            <input
              id="login"
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
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

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center">
              <input
                id="lembrar"
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-zinc-900 focus:ring-zinc-900"
              />
              <label
                htmlFor="lembrar"
                className="ml-2 cursor-pointer text-xs font-medium text-zinc-600"
              >
                Lembrar de mim
              </label>
            </div>
          </div>

          {/* Botão Skeuomorphic em Preto Mineral com relevo 3D */}
          <button
            type="submit"
            disabled={loading}
            className="skeuo-black-button mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
          >
            {loading ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          Ainda não tem uma conta?{" "}
          <Link href="/cadastro" className="font-semibold text-zinc-900 hover:underline">
            Criar conta
          </Link>
        </div>
      </div>

      {/* CSS para Claymorphism, Skeuomorphism e Animação de Fluxo */}
      <style jsx global>{`
        /* Animação 3D contínua dos Nós */
        @keyframes float3D {
          0%, 100% {
            transform: perspective(800px) rotateX(3deg) rotateY(-3deg) translateY(0px);
          }
          50% {
            transform: perspective(800px) rotateX(-3deg) rotateY(3deg) translateY(-8px);
          }
        }

        .clay-node {
          animation: float3D 6s ease-in-out infinite;
          box-shadow:
            inset 0 2px 4px 0 rgba(255, 255, 255, 0.95),
            inset 0 -3px 6px 0 rgba(0, 0, 0, 0.05),
            0 12px 24px -8px rgba(0, 0, 0, 0.12),
            0 4px 8px -2px rgba(0, 0, 0, 0.04);
        }

        .clay-icon-capsule {
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.5),
            0 3px 6px 0 rgba(0, 0, 0, 0.2);
        }

        /* Skeuomorphism no Preto Mineral para o Botão e Badge */
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

        /* Animação do Fluxo Vetorial das Linhas SVG */
        @keyframes flowLineLeft {
          0% {
            stroke-dashoffset: 20;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes flowLineRight {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -20;
          }
        }

        .animate-flow-left {
          animation: flowLineLeft 1.6s linear infinite;
        }

        .animate-flow-right {
          animation: flowLineRight 1.6s linear infinite;
        }
      `}</style>
    </main>
  );
}