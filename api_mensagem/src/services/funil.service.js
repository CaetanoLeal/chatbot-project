//src/services/funil.service.js
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

  async salvarEstrutura(id_funil, { welcomeMessage, messages }) {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      if (!id_funil) {
        throw new Error('Funil inválido')
      }

      if (!welcomeMessage?.ds_mensagem) {
        throw new Error('Mensagem de boas-vindas obrigatória')
      }

      // 🔹 SALVAR BOAS-VINDAS
      const idWelcome = await FunilCadastroRepository.criar(client, {
        id_funil,
        cd_mensagem: welcomeMessage.cd_mensagem,
        ds_mensagem: welcomeMessage.ds_mensagem,
        cd_mensagem_destino: null,
        is_aguardar: welcomeMessage.is_aguardar,
      })

      for (const botao of welcomeMessage.botoes) {
        await FunilCadastroBotaoRepository.criar(client, {
          id_funil_cadastro: idWelcome,
          cd_botao: botao.cd_botao,
          ds_botao: botao.ds_botao,
          cd_mensagem_destino: botao.cd_mensagem_destino,
        })
      }

      // 🔹 SALVAR OUTRAS MENSAGENS
      for (const msg of messages) {
        if (!msg.ds_mensagem) continue

        const idMsg = await FunilChatbotRepository.criar(client, {
          id_funil,
          cd_mensagem: msg.cd_mensagem,
          ds_mensagem: msg.ds_mensagem,
          cd_mensagem_destino: null,
          is_aguardar: msg.is_aguardar,
        })

        for (const botao of msg.botoes) {
          await FunilChatbotBotaoRepository.criar(client, {
            id_funil_chatbot: idMsg,
            cd_botao: botao.cd_botao,
            ds_botao: botao.ds_botao,
            cd_mensagem_destino: botao.cd_mensagem_destino,
          })
        }
      }

      await client.query('COMMIT')

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

module.exports = new FunilService()