// routes/chat.routes.js
"use strict"

const { Router } = require("express")
const ChatController = require("../controllers/ChatController")

const router = Router()

router.get("/", ChatController.list)
router.get("/:id_chat/messages", ChatController.messages)

// NOVAS ROTAS — painel de atendimento
router.post("/:id_chat/mensagens", ChatController.enviarMensagem)
router.post("/:id_chat/finalizar", ChatController.finalizar)

module.exports = router