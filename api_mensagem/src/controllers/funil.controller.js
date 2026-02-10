const FunilService = require('../services/funil.service')

class FunilController {
  async listar(req, res) {
    const data = await FunilService.listar()
    res.json(data)
  }

  async criar(req, res) {
    try {
      const result = await FunilService.criar(req.body)
      res.status(201).json(result)
    } catch (err) {
      console.error(err)
      res.status(500).json({
        error: 'Erro ao criar funil',
        details: err.message
      })
    }
  }
}

module.exports = new FunilController()