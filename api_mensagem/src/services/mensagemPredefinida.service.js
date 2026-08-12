"use strict"

const repository = require("../repositories/mensagemPredefinida.repository")

async function listarMensagensPredefinidas() {
  return repository.listar()
}

async function buscarMensagemPredefinida(id) {
  const mensagem = await repository.buscarPorId(id)

  if (!mensagem) {
    throw new Error("Mensagem predefinida não encontrada")
  }

  return mensagem
}

async function criarMensagemPredefinida({
  no_mensagem_predefinida,
  ds_mensagem_predefinida,
  sg_atalho_tipo
}) {
  if (!no_mensagem_predefinida?.trim()) {
    throw new Error("O nome da mensagem é obrigatório")
  }

  if (!ds_mensagem_predefinida?.trim()) {
    throw new Error("A mensagem é obrigatória")
  }

  return repository.criar(
    no_mensagem_predefinida.trim(),
    ds_mensagem_predefinida.trim(),
    sg_atalho_tipo
  )
}

async function atualizarMensagemPredefinida(
  id,
  {
    no_mensagem_predefinida,
    ds_mensagem_predefinida,
    sg_atalho_tipo,
  }
) {
  if (!no_mensagem_predefinida?.trim()) {
    throw new Error("O nome da mensagem é obrigatório")
  }

  if (!ds_mensagem_predefinida?.trim()) {
    throw new Error("A mensagem é obrigatória")
  }

  const atualizada = await repository.atualizar(
    id,
    no_mensagem_predefinida.trim(),
    ds_mensagem_predefinida.trim(),
    sg_atalho_tipo
  )

  if (!atualizada) {
    throw new Error("Mensagem predefinida não encontrada")
  }

  return atualizada
}

async function excluirMensagemPredefinida(id) {
  const excluida = await repository.excluir(id)

  if (!excluida) {
    throw new Error("Mensagem predefinida não encontrada")
  }

  return excluida
}

async function listartipos() {
  return repository.listartipos()
}

module.exports = {
  listarMensagensPredefinidas,
  buscarMensagemPredefinida,
  criarMensagemPredefinida,
  atualizarMensagemPredefinida,
  excluirMensagemPredefinida,
  listartipos
}