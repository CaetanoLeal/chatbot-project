// routes/mensagemPredefinida.routes.js
"use strict"

const { Router } = require("express")
const MensagemPredefinidaController = require("../controllers/mensagemPredefinida.controller")

const router = Router()

router.get("/", MensagemPredefinidaController.list)
router.get("/:id_mensagem_predefinida", MensagemPredefinidaController.get)
router.post("/", MensagemPredefinidaController.create)
router.put("/:id_mensagem_predefinida", MensagemPredefinidaController.update)
router.delete("/:id_mensagem_predefinida", MensagemPredefinidaController.remove)

module.exports = router