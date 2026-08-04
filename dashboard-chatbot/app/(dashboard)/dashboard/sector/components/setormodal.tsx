//app/(dashboard)/dashboard/sector/components/setormodal.tsx
"use client";

import {
  X,
  Plus,
  Trash2,
  Clock,
  Save,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";

interface Horario {
  id_setor_horario?: string;
  tempId?: string;
  nu_dia_semana: number;
  hr_inicial: string;
  hr_final: string;
}

interface Setor {
  id_setor?: string;
  no_setor: string;
  ds_setor: string | null;
  horarios?: Horario[];
}

interface DiaSemana {
  nu_dia_semana: number;
  ds_dia_semana: string;
  sg_dia_semana: string;
}

interface Props {
  aberto: boolean;
  fechar: () => void;
  setor?: Setor | null;
  atualizarLista: () => void;
}

export default function SetorModal({
  aberto,
  fechar,
  setor,
  atualizarLista,
}: Props) {
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dias, setDias] = useState<DiaSemana[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  /*
      Carrega dias da semana
  */
  async function carregarDias() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dias-semana`
      );

      if (!response.ok) return;

      const data = await response.json();

      setDias(data);
    } catch (error) {
      console.error("Erro ao carregar dias", error);
    }
  }

  /*
      Abre novo cadastro
      ou edição
  */
  useEffect(() => {
    if (!aberto) return;

    carregarDias();

    if (setor) {
      setNome(setor.no_setor);
      setDescricao(setor.ds_setor ?? "");
      setHorarios(setor.horarios ?? []);
    } else {
      setNome("");
      setDescricao("");
      setHorarios([]);
    }
  }, [aberto, setor]);

  if (!aberto) return null;

  /*
      Adiciona novo intervalo de horário
  */
  function adicionarHorario(nu_dia_semana: number) {
    setHorarios((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        nu_dia_semana,
        hr_inicial: "08:00",
        hr_final: "18:00",
      },
    ]);
  }

  /*
      Remove horário
  */
  async function removerHorario(index: number) {
    const horario = horarios[index];

    if (!confirm("Deseja remover este horário?")) {
      return;
    }

    try {
      // já existe no banco
      if (horario.id_setor_horario) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/setores/horarios/${horario.id_setor_horario}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const erro = await response.json();

          throw new Error(erro.error || "Erro ao excluir horário.");
        }
      }

      // remove da tela
      setHorarios((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error(error);

      alert("Erro ao excluir horário.");
    }
  }

  /*
      Atualiza horário (sem bloquear edição em tempo real)
  */
  function alterarHorario(
    index: number,
    campo: "hr_inicial" | "hr_final",
    valor: string
  ) {
    setHorarios((prev) => {
      const copia = [...prev];

      copia[index] = { ...copia[index], [campo]: valor };

      return copia;
    });
  }

  /*
      Retorna os índices de horários com conflito,
      usados para destacar visualmente na tela
  */
  function indicesComConflito(): number[] {
    const conflitantes: number[] = [];

    horarios.forEach((h, i) => {
      horarios.forEach((outro, j) => {
        if (i === j) return;
        if (h.nu_dia_semana !== outro.nu_dia_semana) return;

        if (h.hr_inicial < outro.hr_final && h.hr_final > outro.hr_inicial) {
          if (!conflitantes.includes(i)) conflitantes.push(i);
        }
      });
    });

    return conflitantes;
  }

  /*
      Verifica se dia possui horário
  */
  function horariosDoDia(dia: number) {
    return horarios.filter((h) => h.nu_dia_semana === dia);
  }

  /*
      Remove todos horários de um dia
  */
  async function removerDia(dia: number) {
    if (!confirm("Remover todos os horários deste dia?")) {
      return;
    }

    const horariosDia = horarios.filter((h) => h.nu_dia_semana === dia);

    try {
      for (const horario of horariosDia) {
        if (horario.id_setor_horario) {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/setores/horarios/${horario.id_setor_horario}`,
            {
              method: "DELETE",
            }
          );
        }
      }

      setHorarios((prev) => prev.filter((h) => h.nu_dia_semana !== dia));
    } catch (error) {
      console.error(error);

      alert("Erro ao excluir horários.");
    }
  }

  /*
      Salvar setor
  */
  async function salvar() {
    if (!nome.trim()) {
      alert("Informe o nome do setor.");
      return;
    }

    if (indicesComConflito().length > 0) {
      alert("Existem horários conflitantes. Corrija antes de salvar.");
      return;
    }

    try {
      setSalvando(true);

      let idSetor = setor?.id_setor;

      /*
          Cadastro
      */
      if (!idSetor) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/setores`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              no_setor: nome,
              ds_setor: descricao || null,
            }),
          }
        );

        const data = await response.json();

        idSetor = data.setor.id_setor;
      } else {
        /*
            Atualização
        */
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/setores/${idSetor}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              no_setor: nome,
              ds_setor: descricao || null,
            }),
          }
        );
      }

      /*
          Salva horários novos
      */
      for (const horario of horarios) {
        const body = {
          id_setor: idSetor,
          nu_dia_semana: horario.nu_dia_semana,
          hr_inicial: horario.hr_inicial,
          hr_final: horario.hr_final,
        };

        if (horario.id_setor_horario) {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/setores/horarios/${horario.id_setor_horario}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );
        } else {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/setores/${idSetor}/horarios`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );
        }
      }

      atualizarLista();

      fechar();
    } catch (error) {
      console.error("Erro ao salvar setor", error);

      alert("Erro ao salvar setor.");
    } finally {
      setSalvando(false);
    }
  }

  const conflitos = indicesComConflito();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Fundo */}
      <div onClick={fechar} className="absolute inset-0 bg-black/40" />

      {/* Drawer */}
      <div className="relative w-full max-w-xl h-full bg-white shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-zinc-800">
              {setor ? "Editar setor" : "Novo setor"}
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              Configure o setor e seus horários.
            </p>
          </div>

          <button
            onClick={fechar}
            className="p-2 rounded-lg hover:bg-zinc-100 transition text-zinc-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* NOME */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Nome do setor
            </label>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Financeiro"
              className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400"
            />
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Descrição
            </label>

            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do setor..."
              rows={3}
              className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-zinc-800 outline-none resize-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400"
            />
          </div>

          {/* HORÁRIOS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-zinc-800">
                  Horários de funcionamento
                </h3>

                <p className="text-sm text-zinc-500">
                  Configure abertura e fechamento do setor.
                </p>
              </div>

              <Clock size={22} className="text-blue-600" />
            </div>

            <div className="space-y-3">
              {dias.map((dia) => (
                <div key={dia.nu_dia_semana} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-zinc-700">
                        {dia.ds_dia_semana}
                      </h4>
                    </div>

                    {horariosDoDia(dia.nu_dia_semana).length > 0 && (
                      <button
                        onClick={() => removerDia(dia.nu_dia_semana)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remover dia
                      </button>
                    )}
                  </div>

                  {/* HORÁRIOS DO DIA */}
                  <div className="space-y-3 mt-4">
                    {horarios.map((horario, index) => {
                      if (horario.nu_dia_semana !== dia.nu_dia_semana) {
                        return null;
                      }

                      const temConflito = conflitos.includes(index);

                      return (
                        <div
                          key={horario.id_setor_horario ?? horario.tempId}
                          className={`bg-zinc-50 rounded-lg p-3 border ${
                            temConflito ? "border-red-400" : ""
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            {/* ABERTURA */}
                            <div>
                              <label className="text-xs text-zinc-500">
                                Abertura
                              </label>

                              <input
                                type="time"
                                value={horario.hr_inicial}
                                onChange={(e) =>
                                  alterarHorario(
                                    index,
                                    "hr_inicial",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 border border-zinc-200 text-zinc-800 rounded-lg px-3 py-2 bg-white"
                              />
                            </div>

                            {/* FECHAMENTO */}
                            <div>
                              <label className="text-xs text-zinc-500">
                                Fechamento
                              </label>

                              <input
                                type="time"
                                value={horario.hr_final}
                                onChange={(e) =>
                                  alterarHorario(
                                    index,
                                    "hr_final",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 border border-zinc-200 text-zinc-800 rounded-lg px-3 py-2 bg-white"
                              />
                            </div>
                          </div>

                          {temConflito && (
                            <p className="mt-2 text-xs text-red-500">
                              Este horário conflita com outro do mesmo dia.
                            </p>
                          )}

                          {/* EXCLUIR HORÁRIO */}
                          <button
                            onClick={() => removerHorario(index)}
                            className="mt-3 flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                            Remover horário
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTÃO ADICIONAR */}
                  <button
                    onClick={() => adicionarHorario(dia.nu_dia_semana)}
                    className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    Adicionar horário
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-white">
          <button
            onClick={fechar}
            disabled={salvando}
            className="px-5 py-3 rounded-lg border text-zinc-600 hover:bg-zinc-50 transition"
          >
            Cancelar
          </button>

          <button
            onClick={salvar}
            disabled={salvando}
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition"
          >
            {salvando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}