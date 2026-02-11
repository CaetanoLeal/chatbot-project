//src/repositories/funilChatbot.repository.js
const { v4: uuid } = require('uuid')

class FunilChatbotRepository {
  async criar(client, data) {
    const id = uuid()

    await client.query(`
      INSERT INTO tbl_funil_chatbot
      (id_funil_chatbot, id_funil, cd_mensagem, ds_mensagem, cd_mensagem_destino, is_aguardar)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      id,
      data.id_funil,
      data.cd_mensagem,
      data.ds_mensagem,
      data.cd_mensagem_destino,
      data.is_aguardar
    ])

    return id
  }
}

module.exports = new FunilChatbotRepository()