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

export default function SetoresPage() {

  const [loading, setLoading] = useState(true);

  const [setores, setSetores] = useState<Setor[]>([]);

  const [pesquisa, setPesquisa] = useState("");

  const [refresh, setRefresh] = useState(false);


  const [modalAberto, setModalAberto] =
    useState(false);


  const [setorSelecionado, setSetorSelecionado] =
    useState<Setor | null>(null);

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
    }
  }

  useEffect(() => {
    carregarSetores();
  }, [refresh]);

  async function excluir(id: string) {
    const confirmar = confirm(
      "Deseja realmente excluir este setor?"
    );

    if (!confirmar) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/setores/${id}`,
        {
          method: "DELETE",
        }
      );

      setRefresh(!refresh);
    } catch (err) {
      console.error(err);
    }
  }

  const lista = useMemo(() => {
    return setores.filter((s) => {
      const texto =
        `${s.no_setor} ${s.ds_setor ?? ""}`.toLowerCase();

      return texto.includes(pesquisa.toLowerCase());
    });
  }, [pesquisa, setores]);

  if (loading)
    return (
      <div className="p-8">

        <div className="animate-pulse space-y-5">

          <div className="h-8 w-56 rounded bg-zinc-200" />

          <div className="h-12 rounded bg-zinc-200" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-xl border bg-white p-6 space-y-5"
              >
                <div className="h-5 w-40 rounded bg-zinc-200" />

                <div className="h-4 w-64 rounded bg-zinc-100" />

                <div className="space-y-2">
                  <div className="h-3 rounded bg-zinc-100" />
                  <div className="h-3 rounded bg-zinc-100" />
                  <div className="h-3 rounded bg-zinc-100" />
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>
    );

  return (
    <div 
    className="
    h-full
    overflow-y-auto
    p-8
    space-y-8
   "
  >

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>

          <div className="flex items-center gap-3">

            <div>

              <h1 className="text-3xl font-bold text-zinc-800">
                Setores
              </h1>

              <p className="text-zinc-500 mt-1">
                Gerencie os setores e horários de funcionamento.
              </p>

            </div>

          </div>

        </div>

        <button
          className="
            flex
            items-center
            gap-2
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-3
            rounded-lg
            transition
          "
          onClick={() => {

            setSetorSelecionado(null);

            setModalAberto(true);

          }}
        >
          <Plus size={18} />
          Novo Setor
        </button>

      </div>

      {/* TOPO */}

      <div className="grid lg:grid-cols-3 gap-4">

        <div className="bg-white rounded-xl border p-5">

          <p className="text-zinc-500 text-sm">
            Total de setores
          </p>

          <h2 className="text-3xl font-bold text-zinc-700 mt-2">
            {setores.length}
          </h2>

        </div>

        <div className="bg-white rounded-xl border p-5">

          <p className="text-zinc-500 text-sm">
            Horários cadastrados
          </p>

          <h2 className="text-3xl font-bold text-zinc-700 mt-2">

            {setores.reduce(
              (total, setor) =>
                total + (setor.horarios?.length || 0),
              0
            )}

          </h2>

        </div>

        <button
          onClick={() => setRefresh(!refresh)}
          className="
            bg-white
            border
            rounded-xl
            flex
            justify-center
            items-center
            gap-2
            hover:bg-zinc-50
            transition
          "
        >
          <RefreshCw size={18} className="text-zinc-700" />
            <p className="text-zinc-500">
          Atualizar
            </p>

        </button>

      </div>

      {/* PESQUISA */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-3.5 text-zinc-400"
        />

        <input
          value={pesquisa}
          onChange={(e) =>
            setPesquisa(e.target.value)
          }
          placeholder="Pesquisar setor..."
          className="
              w-full
              rounded-xl
              border
              bg-white
              pl-11
              pr-4
              py-3
              outline-none
              focus:ring-2
              focus:ring-blue-500
              placeholder:text-zinc-400
          "
        />

      </div>

      {/* LISTAGEM */}

    <div className="grid gap-6 lg:grid-cols-2">
                {lista.length === 0 && (
          <div className="col-span-full bg-white border rounded-xl p-10 text-center">
            <Building2
              size={48}
              className="mx-auto text-zinc-300 mb-4"
            />

            <h3 className="text-lg font-semibold text-zinc-700">
              Nenhum setor encontrado
            </h3>

            <p className="text-zinc-500 mt-2">
              Cadastre um novo setor para começar.
            </p>
          </div>
        )}

        {lista.map((setor) => (
          <div
            key={setor.id_setor}
            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all"
          >
            {/* CABEÇALHO */}

            <div className="border-b p-6 flex justify-between items-start">

              <div>

                <h2 className="text-xl font-semibold text-zinc-800">
                  {setor.no_setor}
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  {setor.ds_setor || "Sem descrição"}
                </p>

              </div>

              <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
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

              {setor.horarios?.map((horario) => (
                <div
                  key={horario.id_setor_horario}
                  className="flex items-center justify-between border rounded-lg px-4 py-3 mb-3 last:mb-0"
                >

                  <div className="flex items-center gap-3">

                    <div className="bg-zinc-100 rounded-full p-2">
                      <Clock
                        size={16}
                        className="text-zinc-600"
                      />
                    </div>

                    <div>

                      <div className="font-medium text-zinc-700">
                        {horario.ds_dia_semana}
                      </div>

                      <div className="text-sm text-zinc-500">
                        {horario.hr_inicial.slice(0,5)}
                        {" às "}
                        {horario.hr_final.slice(0,5)}
                      </div>

                    </div>

                  </div>

                  <span className="bg-zinc-100 text-zinc-600 text-xs px-3 py-1 rounded-full">
                    {horario.sg_dia_semana}
                  </span>

                </div>
              ))}

            </div>

            {/* RODAPÉ */}

            <div className="border-t p-4 flex justify-end gap-3">

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
                    hover:bg-zinc-50
                    transition
                    text-zinc-500
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
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    transition
                "
              >
                <Trash2 size={16} />

                Excluir
              </button>

            </div>
            

          </div>
        ))}

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
      