// services/mensagemPredefinidaService.js
"use strict"

const mensagemPredefinidaRepository = require("../repositories/mensagemPredefinida.repository")

async function listarMensagensPredefinidas() {
  return mensagemPredefinidaRepository.listar()
}

async function buscarMensagemPredefinida(id_mensagem_predefinida) {
  const mensagem = await mensagemPredefinidaRepository.buscarPorId(id_mensagem_predefinida)

  if (!mensagem) {
    throw new Error("Mensagem predefinida não encontrada")
  }

  return mensagem
}

async function criarMensagemPredefinida({ ds_mensagem_predefinida }) {
  if (!ds_mensagem_predefinida || !ds_mensagem_predefinida.trim()) {
    throw new Error("O campo 'ds_mensagem_predefinida' é obrigatório")
  }

  return mensagemPredefinidaRepository.criar(ds_mensagem_predefinida.trim())
}

async function atualizarMensagemPredefinida(id_mensagem_predefinida, { ds_mensagem_predefinida }) {
  if (!ds_mensagem_predefinida || !ds_mensagem_predefinida.trim()) {
    throw new Error("O campo 'ds_mensagem_predefinida' é obrigatório")
  }

  const atualizada = await mensagemPredefinidaRepository.atualizar(
    id_mensagem_predefinida,
    ds_mensagem_predefinida.trim()
  )

  if (!atualizada) {
    throw new Error("Mensagem predefinida não encontrada")
  }

  return atualizada
}

async function excluirMensagemPredefinida(id_mensagem_predefinida) {
  const excluida = await mensagemPredefinidaRepository.excluir(id_mensagem_predefinida)

  if (!excluida) {
    throw new Error("Mensagem predefinida não encontrada")
  }

  return excluida
}

module.exports = {
  listarMensagensPredefinidas,
  buscarMensagemPredefinida,
  criarMensagemPredefinida,
  atualizarMensagemPredefinida,
  excluirMensagemPredefinida,
}