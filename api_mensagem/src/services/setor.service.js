//src/services/setor.service.js
"use strict";

const db = require("../config/db");
const repository = require("../repositories/setor.repository");

class SetorService {

    /*======================================================
        LISTAR
    ======================================================*/

    async listar() {

        return await repository.listar();

    }

    /*======================================================
        BUSCAR
    ======================================================*/

    async buscarPorId(idSetor) {

        const setor = await repository.buscarPorId(idSetor);

        if (!setor)
            throw new Error("Setor não encontrado.");

        return setor;

    }

    /*======================================================
        CADASTRAR SETOR
    ======================================================*/

    async cadastrar(dados) {

        if (!dados.no_setor)
            throw new Error("Nome do setor é obrigatório.");

        const client = await db.connect();

        try {

            await client.query("BEGIN");

            const setor = await repository.inserir(
                dados,
                client
            );

            if (dados.horarios?.length) {

                for (const horario of dados.horarios) {

                    const conflito =
                        await repository.buscarConflitoHorario(
                            setor.id_setor,
                            horario.nu_dia_semana,
                            horario.hr_inicial,
                            horario.hr_final,
                            null,
                            client
                        );

                    if (conflito)
                        throw new Error(
                            "Existe conflito de horário."
                        );

                    await repository.inserirHorario(
                        {
                            id_setor: setor.id_setor,
                            nu_dia_semana: horario.nu_dia_semana,
                            hr_inicial: horario.hr_inicial,
                            hr_final: horario.hr_final
                        },
                        client
                    );

                }

            }

            await client.query("COMMIT");

            return await repository.buscarPorId(
                setor.id_setor
            );

        }
        catch (error) {

            await client.query("ROLLBACK");

            throw error;

        }
        finally {

            client.release();

        }

    }

    /*======================================================
        ATUALIZAR
    ======================================================*/

    async atualizar(idSetor, dados) {

        const setor = await repository.buscarPorId(idSetor);

        if (!setor)
            throw new Error("Setor não encontrado.");

        return await repository.atualizar(
            idSetor,
            dados
        );

    }

    /*======================================================
        EXCLUIR
    ======================================================*/

    async excluir(idSetor) {

        const setor = await repository.buscarPorId(idSetor);

        if (!setor)
            throw new Error("Setor não encontrado.");

        return await repository.excluir(idSetor);

    }

    /*======================================================
        HORÁRIOS
    ======================================================*/

    async listarHorarios(idSetor) {

        return await repository.listarHorarios(idSetor);

    }

    /*======================================================
        CADASTRAR HORÁRIO
    ======================================================*/

    async cadastrarHorario(dados) {

        const conflito =
            await repository.buscarConflitoHorario(
                dados.id_setor,
                dados.nu_dia_semana,
                dados.hr_inicial,
                dados.hr_final
            );

        if (conflito)
            throw new Error(
                "Existe conflito de horário para este dia."
            );

        return await repository.inserirHorario(
            dados
        );

    }

    /*======================================================
        ATUALIZAR HORÁRIO
    ======================================================*/

    async atualizarHorario(idHorario, dados) {

        const conflito =
            await repository.buscarConflitoHorario(
                dados.id_setor,
                dados.nu_dia_semana,
                dados.hr_inicial,
                dados.hr_final,
                idHorario
            );

        if (conflito)
            throw new Error(
                "Existe conflito de horário."
            );

        return await repository.atualizarHorario(
            idHorario,
            dados
        );

    }

    /*======================================================
        EXCLUIR HORÁRIO
    ======================================================*/

    async excluirHorario(idHorario) {

        return await repository.excluirHorario(
            idHorario
        );

    }

}

module.exports = new SetorService();