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
    const limit = req.query.limit ? Number(req.query.limit) : 30
    const beforeDhEnvio = req.query.before_dh_envio || null
    const beforeIdMensagem = req.query.before_id || null

    const msgs = await chatService.getMessagesByChat(id_chat, {
      limit,
      beforeDhEnvio,
      beforeIdMensagem,
    })

    return res.json({ success: true, data: msgs })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

/* ============================================================
   POST /api/chats/:id_chat/mensagens
   body: { texto: string, id_atendente: string }
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
   POST /api/chats/:id_chat/finalizar
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

/* ============================================================
   NOVO — POST /api/chats/:id_chat/transferir
   body: { id_setor: string }

   Move o atendimento para outro setor, deixando-o pendente
   (sg_chat_status = 'P') para que alguém daquele setor assuma.
   ============================================================ */
async function transferir(req, res) {
  try {
    const { id_chat } = req.params
    const { id_setor } = req.body

    if (!id_setor) {
      return res.status(400).json({
        success: false,
        message: "O campo 'id_setor' é obrigatório",
      })
    }

    const resultado = await chatService.transferirAtendimento({
      idChat: id_chat,
      idSetor: id_setor,
    })

    return res.json({ success: true, data: resultado })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }

}
/* ============================================================
 POST /api/chats/:id_chat/iniciar
 ============================================================ */
  async function iniciar(req, res) {
    try {
      const { id_chat } = req.params
      await chatService.iniciarAtendimento({ idChat: id_chat })
      return res.json({ success: true, message: "Atendimento iniciado com sucesso." })
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message })
    }
  }

module.exports = {
  list,
  messages,
  enviarMensagem,
  finalizar,
  transferir,
  iniciar,
}