// controllers/ChatController.js
"use strict"

const chatService = require("../services/chatService")

async function list(req, res) {
  try {
    const chats = await chatService.listChats()
    return res.json({ success: true, data: chats })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

async function messages(req, res) {
  try {
    const { id_chat } = req.params
    const msgs = await chatService.getMessagesByChat(id_chat)
    return res.json({ success: true, data: msgs })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

/* ============================================================
   NOVO — POST /api/chats/:id_chat/mensagens
   body: { texto: string, id_atendente: string }
   Já valida se o atendente é capacitado pro setor do chat.
   ============================================================ */
async function enviarMensagem(req, res) {
  try {
    const { id_chat } = req.params
    const { texto, id_atendente } = req.body

    if (!texto || !texto.trim()) {
      return res.status(400).json({
        success: false,
        message: "O campo 'texto' é obrigatório",
      })
    }

    const resultado = await chatService.enviarMensagemAtendente({
      idChat: id_chat,
      texto: texto.trim(),
      idAtendente: id_atendente || null,
    })

    return res.json({ success: true, data: resultado })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

/* ============================================================
   NOVO — POST /api/chats/:id_chat/finalizar
   ============================================================ */
async function finalizar(req, res) {
  try {
    const { id_chat } = req.params
    await chatService.finalizarAtendimento({ idChat: id_chat })
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  list,
  messages,
  enviarMensagem,
  finalizar,
}