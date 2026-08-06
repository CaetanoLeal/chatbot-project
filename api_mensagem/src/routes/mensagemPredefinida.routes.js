// routes/mensagemPredefinida.routes.js
"use strict"

const { Router } = require("express")
const MensagemPredefinidaController = require("../controllers/mensagemPredefinida.controller")

const router = Router()

router.get("/", MensagemPredefinidaController.list)
router.post("/", MensagemPredefinidaController.create)
router.get("/:id_mensagem_predefinida", MensagemPredefinidaController.get)
router.put("/:id_mensagem_predefinida", MensagemPredefinidaController.update)
router.delete("/:id_mensagem_predefinida", MensagemPredefinidaController.remove)

module.exports = router