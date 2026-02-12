//src/controllers/funil.controller.js
const FunilService = require('../services/funil.service')

class FunilController {
  async listar(req, res) {
    const funis = await FunilService.listar()
    res.json(funis)
  }

  async criar(req, res) {
    try {
      const { name, description } = req.body

      const result = await FunilService.criar({ name, description })

      res.status(201).json({
        message: 'Funil criado com sucesso',
        id_funil: result.id_funil,
      })
    } catch (error) {
      res.status(400).json({
        error: error.message,
      })
    }
  }

  async salvarEstrutura(req, res) {
    try {
      const { id } = req.params

      await FunilService.salvarEstrutura(id, req.body)

      res.json({ message: 'Estrutura salva com sucesso' })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }
  async buscarPorId(req, res) {
    try {
      const { id } = req.params

      const funil = await FunilService.buscarPorId(id)

      if (!funil) {
        return res.status(404).json({ error: 'Funil não encontrado' })
      }

      res.json(funil)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }
}

module.exports = new FunilController()