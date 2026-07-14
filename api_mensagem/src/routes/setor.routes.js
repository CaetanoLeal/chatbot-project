"use strict";

const { Router } = require("express");
const SetorController = require("../controllers/setor.controller");

const router = Router();

/* ======================================================
    SETORES
====================================================== */

router.get("/", SetorController.listar);

router.get("/:id", SetorController.buscarPorId);

router.post("/", SetorController.criar);

router.put("/:id", SetorController.atualizar);

router.delete("/:id", SetorController.excluir);

/* ======================================================
    HORÁRIOS
====================================================== */

router.get("/:id/horarios", SetorController.listarHorarios);

router.post("/:id/horarios", SetorController.criarHorario);

router.put("/horarios/:id", SetorController.atualizarHorario);

router.delete("/horarios/:id", SetorController.excluirHorario);

module.exports = router;