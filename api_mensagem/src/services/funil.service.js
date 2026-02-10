const db = require('../config/db')
const FunilRepository = require('../repositories/funil.repository')
const FunilCadastroRepository = require('../repositories/funilCadastro.repository')
const FunilCadastroBotaoRepository = require('../repositories/funilCadastroBotao.repository')
const FunilChatbotRepository = require('../repositories/funilChatbot.repository')
const FunilChatbotBotaoRepository = require('../repositories/funilChatbotBotao.repository')

class FunilService {
  async listar() {
    return FunilRepository.listar()
  }

  async criar({ name, description }) {
    if (!name || !description) {
      throw new Error('Nome e descrição são obrigatórios')
    }

    return FunilRepository.criar({ name, description })
  }
}

module.exports = new FunilService()