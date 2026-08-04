"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Building2,
  RefreshCw,
} from "lucide-react";

import SetorModal from "./components/setormodal";

interface Horario {
  id_setor_horario: string;
  nu_dia_semana: number;
  ds_dia_semana: string;
  sg_dia_semana: string;
  hr_inicial: string;
  hr_final: string;
}

interface Setor {
  id_setor: string;
  no_setor: string;
  ds_setor: string | null;
  total_horarios?: number;
  horarios?: Horario[];
}

/*
    Verifica se o setor está com algum horário
    ativo neste exato momento.

    OBS: assume nu_dia_semana no padrão de
    Date.getDay() (0 = Domingo ... 6 = Sábado).
    Ajuste aqui se sua API usar outra convenção.
*/
function setorAbertoAgora(horarios?: Horario[]): boolean {
  if (!horarios || horarios.length === 0) return false;

  const agora = new Date();
  const diaAtual = agora.getDay();
  const horaAtual = agora.toTimeString().slice(0, 5);

  return horarios.some((h) => {
    if (h.nu_dia_semana !== diaAtual) return false;

    const inicio = h.hr_inicial.slice(0, 5);
    const fim = h.hr_final.slice(0, 5);

    return horaAtual >= inicio && horaAtual <= fim;
  });
}

function agruparPorDia(horarios?: Horario[]) {
  if (!horarios || horarios.length === 0) return [];

  const mapa = new Map<
    number,
    {
      ds_dia_semana: string;
      sg_dia_semana: string;
      horarios: Horario[];
    }
  >();

  horarios.forEach((h) => {
    if (!mapa.has(h.nu_dia_semana)) {
      mapa.set(h.nu_dia_semana, {
        ds_dia_semana: h.ds_dia_semana,
        sg_dia_semana: h.sg_dia_semana,
        horarios: [],
      });
    }

    mapa.get(h.nu_dia_semana)!.horarios.push(h);
  });

  return Array.from(mapa.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([nu_dia_semana, dados]) => ({
      nu_dia_semana,
      ...dados,
    }));
}

export default function SetoresPage() {
  const [loading, setLoading] = useState(true);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [setorSelecionado, setSetorSelecionado] = useState<Setor | null>(
    null
  );

  async function carregarSetores() {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/setores`
      );

      const data = await response.json();

      const setoresComHorarios = await Promise.all(
        data.map(async (setor: Setor) => {
          const r = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/setores/${setor.id_setor}`
          );

          return await r.json();
        })
      );

      setSetores(setoresComHorarios);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregarSetores();
  }, [refresh]);

  async function excluir(id: string) {
    const confirmar = confirm("Deseja realmente excluir este setor?");

    if (!confirmar) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/setores/${id}`, {
        method: "DELETE",
      });

      setRefresh(!refresh);
    } catch (err) {
      console.error(err);
    }
  }

  const lista = useMemo(() => {
    return setores.filter((s) => {
      const texto = `${s.no_setor} ${s.ds_setor ?? ""}`.toLowerCase();

      return texto.includes(pesquisa.toLowerCase());
    });
  }, [pesquisa, setores]);

  const totalHorarios = setores.reduce(
    (total, setor) => total + (setor.horarios?.length || 0),
    0
  );

  if (loading)
    return (
      <div className="h-full overflow-y-auto bg-zinc-50 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-9 w-56 rounded-lg bg-zinc-200" />
          <div className="h-4 w-96 rounded bg-zinc-200" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="h-24 rounded-xl bg-zinc-200" />
            <div className="h-24 rounded-xl bg-zinc-200" />
            <div className="h-24 rounded-xl bg-zinc-200" />
          </div>

          <div className="h-12 rounded-xl bg-zinc-200" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5"
              >
                <div className="h-5 w-40 rounded bg-zinc-200" />
                <div className="h-4 w-64 rounded bg-zinc-100" />

                <div className="space-y-2">
                  <div className="h-12 rounded-lg bg-zinc-100" />
                  <div className="h-12 rounded-lg bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-full overflow-y-auto bg-zinc-50 p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Setores
          </h1>

          <p className="text-zinc-500 mt-1">
            Gerencie os setores e horários de atendimento do chatbot.
          </p>
        </div>

        <button
          className="
            flex
            items-center
            gap-2
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            px-5
            py-3
            rounded-lg
            font-medium
            shadow-sm
            shadow-indigo-600/20
            transition
          "
          onClick={() => {
            setSetorSelecionado(null);
            setModalAberto(true);
          }}
        >
          <Plus size={18} />
          Novo setor
        </button>
      </div>

      {/* TOPO */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center gap-4">
          <div className="bg-indigo-50 rounded-lg p-3">
            <Building2 size={20} className="text-indigo-600" />
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Total de setores</p>
            <h2 className="text-2xl font-bold text-zinc-800 mt-0.5">
              {setores.length}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center gap-4">
          <div className="bg-emerald-50 rounded-lg p-3">
            <Clock size={20} className="text-emerald-600" />
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Horários cadastrados</p>
            <h2 className="text-2xl font-bold text-zinc-800 mt-0.5">
              {totalHorarios}
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            setAtualizando(true);
            setRefresh(!refresh);
          }}
          className="
            bg-white
            border
            border-zinc-200
            rounded-xl
            flex
            justify-center
            items-center
            gap-2
            hover:bg-zinc-50
            transition
            text-zinc-600
            font-medium
          "
        >
          <RefreshCw
            size={18}
            className={atualizando ? "animate-spin" : ""}
          />
          Atualizar
        </button>
      </div>

      {/* PESQUISA */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Pesquisar setor..."
          className="
              w-full
              rounded-xl
              border
              border-zinc-200
              bg-white
              pl-11
              pr-4
              py-3
              text-zinc-800
              outline-none
              focus:ring-2
              focus:ring-indigo-500
              focus:border-transparent
              placeholder:text-zinc-400
          "
        />
      </div>

      {/* LISTAGEM */}
      <div className="grid gap-6 lg:grid-cols-2">
        {lista.length === 0 && (
          <div className="col-span-full bg-white border border-zinc-200 rounded-xl p-12 text-center">
            <Building2 size={40} className="mx-auto text-zinc-300 mb-4" />

            <h3 className="text-lg font-semibold text-zinc-700">
              Nenhum setor por aqui ainda
            </h3>

            <p className="text-zinc-500 mt-2">
              Crie o primeiro setor para organizar os horários de
              atendimento.
            </p>
          </div>
        )}

        {lista.map((setor) => {
          const aberto = setorAbertoAgora(setor.horarios);

          return (
            <div
              key={setor.id_setor}
              className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
            >
              {/* CABEÇALHO */}
              <div className="border-b border-zinc-100 p-6 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        aberto
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-zinc-300"
                      }`}
                    />

                    <h2 className="text-xl font-semibold text-zinc-800">
                      {setor.no_setor}
                    </h2>
                  </div>

                  <p className="text-sm text-zinc-500 mt-1 ml-4.5">
                    {setor.ds_setor || "Sem descrição"}
                  </p>

                  <span
                    className={`inline-block mt-2 ml-4.5 text-xs font-medium ${
                      aberto ? "text-emerald-600" : "text-zinc-400"
                    }`}
                  >
                    {aberto ? "Aberto agora" : "Fechado no momento"}
                  </span>
                </div>

                <span className="bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
                  {setor.horarios?.length || 0} horário(s)
                </span>
              </div>

              {/* HORÁRIOS */}
                <div className="p-6">
                  {!setor.horarios?.length && (
                    <div className="text-zinc-400 italic text-sm">
                      Nenhum horário cadastrado.
                    </div>
                  )}

                  {agruparPorDia(setor.horarios).map((dia) => (
                    <div
                      key={dia.nu_dia_semana}
                      className="border border-zinc-100 bg-zinc-50/60 rounded-lg px-4 py-3 mb-3 last:mb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-white border border-zinc-200 rounded-full p-2">
                            <Clock size={16} className="text-zinc-500" />
                          </div>

                          <div className="font-medium text-zinc-700">
                            {dia.ds_dia_semana}
                          </div>
                        </div>

                        <span className="bg-white border border-zinc-200 text-zinc-500 text-xs px-3 py-1 rounded-full font-medium">
                          {dia.sg_dia_semana}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 ml-11">
                        {dia.horarios.map((h) => (
                          <span
                            key={h.id_setor_horario}
                            className="text-sm text-zinc-500 bg-white border border-zinc-200 rounded-full px-3 py-1"
                          >
                            {h.hr_inicial.slice(0, 5)} às {h.hr_final.slice(0, 5)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              {/* RODAPÉ */}
              <div className="border-t border-zinc-100 p-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSetorSelecionado(setor);
                    setModalAberto(true);
                  }}
                  className="
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-lg
                      border
                      border-zinc-200
                      hover:bg-zinc-50
                      transition
                      text-zinc-600
                      font-medium
                  "
                >
                  <Pencil size={16} />
                  Editar
                </button>

                <button
                  onClick={() => excluir(setor.id_setor)}
                  className="
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-lg
                      bg-red-50
                      hover:bg-red-100
                      text-red-600
                      font-medium
                      transition
                  "
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SetorModal
        aberto={modalAberto}
        fechar={() => {
          setModalAberto(false);
        }}
        setor={setorSelecionado}
        atualizarLista={() => {
          setRefresh(!refresh);
        }}
      />
    </div>
  );
}