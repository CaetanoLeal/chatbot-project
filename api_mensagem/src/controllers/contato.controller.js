// src/controllers/contato.controller.js
"use strict"

const ContatoService = require("../services/contato.service")
const logger = require("../../logger")

class ContatoController {
  async listar(req, res) {
    try {
      const contatos = await ContatoService.listarContatos()
      return res.json(contatos)
    } catch (err) {
      logger.error(`❌ Erro ao listar contatos: ${err.message}`)
      return res.status(500).json({ error: "Erro ao listar contatos" })
    }
  }
}

module.exports = new ContatoController()