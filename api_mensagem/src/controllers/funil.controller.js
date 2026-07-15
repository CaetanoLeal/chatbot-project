// src/controllers/funil.controller.js
const FunilService = require('../services/funil.service')
const logger = require('../../logger')
const setorService = require('../services/setor.service')

class FunilController {
  async listar(req, res) {
    try {
      const funis = await FunilService.listar()
      return res.json(funis)
    } catch (err) {
      logger.error(`❌ Erro ao listar funis: ${err.message}`)
      return res.status(500).json({ error: 'Erro ao listar funis' })
    }
  }

  async buscarPorId(req, res) {
    try {
      const funil = await FunilService.buscarPorId(req.params.id)
      if (!funil) return res.status(404).json({ error: 'Funil não encontrado' })
      return res.json(funil)
    } catch (err) {
      logger.error(`❌ Erro ao buscar funil: ${err.message}`)
      return res.status(500).json({ error: 'Erro ao buscar funil' })
    }
  }

  async criar(req, res) {
    try {
      const { name, description } = req.body
      const funil = await FunilService.criar({ name, description })
      return res.status(201).json(funil)
    } catch (err) {
      logger.error(`❌ Erro ao criar funil: ${err.message}`)
      return res.status(400).json({ error: err.message })
    }
  }

  async salvarEstrutura(req, res) {
    try {
      const { cadastro, chatbot } = req.body
      await FunilService.salvarEstrutura(req.params.id, { cadastro, chatbot })
      return res.json({ success: true })
    } catch (err) {
      logger.error(`❌ Erro ao salvar estrutura do funil: ${err.message}`)
      return res.status(400).json({ error: err.message })
    }
  }

  /* ================= CAMPOS PERSONALIZADOS ================= */

  async listarTiposCampo(req, res) {
    try {
      const tipos = await FunilService.listarTiposCampo()
      return res.json(tipos)
    } catch (err) {
      logger.error(`❌ Erro ao listar tipos de campo: ${err.message}`)
      return res.status(500).json({ error: 'Erro ao listar tipos de campo' })
    }
  }

  async listarCampos(req, res) {
    try {
      const campos = await FunilService.listarCampos()
      return res.json(campos)
    } catch (err) {
      logger.error(`❌ Erro ao listar campos: ${err.message}`)
      return res.status(500).json({ error: 'Erro ao listar campos' })
    }
  }

  async criarCampo(req, res) {
    try {
      const id_campo = await FunilService.criarCampo(req.body)
      return res.status(201).json({ id_campo })
    } catch (err) {
      logger.error(`❌ Erro ao criar campo: ${err.message}`)
      return res.status(400).json({ error: err.message })
    }
  }

  async atualizarCampo(req, res) {
    try {
      await FunilService.atualizarCampo(req.params.idCampo, req.body)
      return res.json({ success: true })
    } catch (err) {
      logger.error(`❌ Erro ao atualizar campo: ${err.message}`)
      return res.status(400).json({ error: err.message })
    }
  }

  async removerCampo(req, res) {
    try {
      await FunilService.removerCampo(req.params.idCampo)
      return res.json({ success: true })
    } catch (err) {
      logger.error(`❌ Erro ao remover campo: ${err.message}`)
      return res.status(400).json({ error: err.message })
    }
  }

  /* ================= SETORES ================= */

  async listarSetores(req, res) {
    try {
      const setores = await FunilService.listarSetores(req.params.id)
      return res.json(setores)
    } catch (err) {
      logger.error(`❌ Erro ao listar setores: ${err.message}`)
      return res.status(500).json({ error: 'Erro ao listar setores' })
    }
  }

  async criarSetor(req, res) {
    try {
      const id_setor = await setorService.cadastrar(req.body)
      return res.status(201).json({ id_setor })
    } catch (err) {
      logger.error(`❌ Erro ao criar setor: ${err.message}`)
      return res.status(400).json({ error: err.message })
    }
  }

  async atualizarSetor(req, res) {
    try {
      await FunilService.atualizarSetor(req.params.idSetor, req.body)
      return res.json({ success: true })
    } catch (err) {
      logger.error(`❌ Erro ao atualizar setor: ${err.message}`)
      return res.status(400).json({ error: err.message })
    }
  }

  async removerSetor(req, res) {
    try {
      await FunilService.removerSetor(req.params.idSetor)
      return res.json({ success: true })
    } catch (err) {
      logger.error(`❌ Erro ao remover setor: ${err.message}`)
      return res.status(400).json({ error: err.message })
    }
  }
}

module.exports = new FunilController()