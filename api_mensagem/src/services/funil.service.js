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

  async criar(payload) {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      /** 1️⃣ FUNIL */
      const id_funil = await FunilRepository.criar(
        client,
        payload.funil.nome,
        payload.funil.descricao
      )

      /** 2️⃣ MENSAGEM DE BOAS-VINDAS */
      const id_funil_cadastro =
        await FunilCadastroRepository.criar(client, {
          id_funil,
          cd_mensagem: payload.cadastro.cd_mensagem,
          ds_mensagem: payload.cadastro.ds_mensagem,
          cd_mensagem_destino: payload.cadastro.cd_mensagem_destino,
          is_aguardar: payload.cadastro.is_aguardar,
        })

      /** 3️⃣ BOTÕES DA BOAS-VINDAS */
      for (const botao of payload.cadastro.botoes) {
        await FunilCadastroBotaoRepository.criar(client, {
          id_funil_cadastro,
          cd_botao: botao.cd_botao,
          ds_botao: botao.ds_botao,
          cd_mensagem_destino: botao.cd_mensagem_destino,
        })
      }

      /** 4️⃣ MENSAGENS DO CHATBOT */
      const mapaChatbot = {}

      for (const msg of payload.chatbot) {
        const id_funil_chatbot =
          await FunilChatbotRepository.criar(client, {
            id_funil,
            cd_mensagem: msg.cd_mensagem,
            ds_mensagem: msg.ds_mensagem,
            cd_mensagem_destino: msg.cd_mensagem_destino,
            is_aguardar: msg.is_aguardar,
          })

        mapaChatbot[msg.cd_mensagem] = id_funil_chatbot
      }

      /** 5️⃣ BOTÕES DO CHATBOT */
      for (const msg of payload.chatbot) {
        const id_funil_chatbot = mapaChatbot[msg.cd_mensagem]

        for (const botao of msg.botoes) {
          await FunilChatbotBotaoRepository.criar(client, {
            id_funil_chatbot,
            cd_botao: botao.cd_botao,
            ds_botao: botao.ds_botao,
            cd_mensagem_destino: botao.cd_mensagem_destino,
          })
        }
      }

      await client.query('COMMIT')
      return { success: true, id_funil }

    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

module.exports = new FunilService()