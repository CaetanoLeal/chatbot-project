//src/controllers/setor.controller.js
"use strict";

const SetorService = require("../services/setor.service");

class SetorController {

    /* ======================================================
        SETORES
    ======================================================= */

    async listar(req, res) {

        try {

            const setores = await SetorService.listar();

            res.json(setores);

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

    /* ====================================================== */

    async buscarPorId(req, res) {

        try {

            const { id } = req.params;

            const setor = await SetorService.buscarPorId(id);

            if (!setor) {
                return res.status(404).json({
                    error: "Setor não encontrado."
                });
            }

            res.json(setor);

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

    /* ====================================================== */

    async criar(req, res) {

        try {

            const setor = await SetorService.cadastrar(req.body);

            res.status(201).json({
                message: "Setor criado com sucesso.",
                setor
            });

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

    /* ====================================================== */

    async atualizar(req, res) {

        try {

            const { id } = req.params;

            const setor = await SetorService.atualizar(
                id,
                req.body
            );

            res.json({
                message: "Setor atualizado com sucesso.",
                setor
            });

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

    /* ====================================================== */

    async excluir(req, res) {

        try {

            const { id } = req.params;

            await SetorService.excluir(id);

            res.json({
                message: "Setor excluído com sucesso."
            });

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

    /* ======================================================
        HORÁRIOS
    ======================================================= */

    async listarHorarios(req, res) {

        try {

            const { id } = req.params;

            const horarios = await SetorService.listarHorarios(id);

            res.json(horarios);

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

    /* ====================================================== */

    async criarHorario(req, res) {

        try {

            const { id } = req.params;

            const horario = await SetorService.cadastrarHorario({
                ...req.body,
                id_setor: id
            });

            res.status(201).json({
                message: "Horário cadastrado com sucesso.",
                horario
            });

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

    /* ====================================================== */

    async atualizarHorario(req, res) {

        try {

            const { id } = req.params;

            const horario = await SetorService.atualizarHorario(
                id,
                req.body
            );

            res.json({
                message: "Horário atualizado com sucesso.",
                horario
            });

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

    /* ====================================================== */

    async excluirHorario(req, res) {

        try {

            const { id } = req.params;

            await SetorService.excluirHorario(id);

            res.json({
                message: "Horário excluído com sucesso."
            });

        } catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

}

module.exports = new SetorController();