// controllers/MensagemPredefinidaController.js
"use strict"

const mensagemPredefinidaService = require("../services/mensagemPredefinida.service")

async function list(req, res) {
  try {
    const mensagens = await mensagemPredefinidaService.listarMensagensPredefinidas()
    return res.json({ success: true, data: mensagens })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

async function get(req, res) {
  try {
    const { id_mensagem_predefinida } = req.params
    const mensagem = await mensagemPredefinidaService.buscarMensagemPredefinida(id_mensagem_predefinida)
    return res.json({ success: true, data: mensagem })
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message })
  }
}

async function create(req, res) {
  try {
    const { ds_mensagem_predefinida } = req.body
    const mensagem = await mensagemPredefinidaService.criarMensagemPredefinida({ ds_mensagem_predefinida })
    return res.status(201).json({ success: true, data: mensagem })
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message })
  }
}

async function update(req, res) {
  try {
    const { id_mensagem_predefinida } = req.params
    const { ds_mensagem_predefinida } = req.body
    const mensagem = await mensagemPredefinidaService.atualizarMensagemPredefinida(id_mensagem_predefinida, {
      ds_mensagem_predefinida,
    })
    return res.json({ success: true, data: mensagem })
  } catch (err) {
    const status = err.message.includes("não encontrada") ? 404 : 400
    return res.status(status).json({ success: false, message: err.message })
  }
}

async function remove(req, res) {
  try {
    const { id_mensagem_predefinida } = req.params
    await mensagemPredefinidaService.excluirMensagemPredefinida(id_mensagem_predefinida)
    return res.json({ success: true })
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message })
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
}