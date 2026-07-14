// src/repositories/funilChatbot.repository.js
const { v4: uuid } = require('uuid')

class FunilChatbotRepository {
  async criar(client, data) {
    const id = uuid()

    await client.query(
      `
      INSERT INTO tbl_funil_chatbot
        (id_funil_chatbot, id_funil, cd_mensagem, ds_mensagem,
         cd_mensagem_destino, is_aguardar, is_finalizar,
         id_setor, id_campo, sg_chat_status, pos_x, pos_y)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `,
      [
        id,
        data.id_funil,
        data.cd_mensagem,
        data.ds_mensagem,
        data.cd_mensagem_destino ?? null,
        data.is_aguardar ?? false,
        data.is_finalizar ?? false,
        data.id_setor ?? null,
        data.id_campo ?? null,
        data.sg_chat_status ?? null,
        data.pos_x ?? null,
        data.pos_y ?? null,
      ]
    )

    return id
  }

  async removerPorFunil(client, id_funil) {
    await client.query(`DELETE FROM tbl_funil_chatbot WHERE id_funil = $1`, [id_funil])
  }

  async listarPorFunil(id_funil) {
    const db = require('../config/db')
    const { rows } = await db.query(
      `
      SELECT *
      FROM tbl_funil_chatbot
      WHERE id_funil = $1
      ORDER BY cd_mensagem
      `,
      [id_funil]
    )
    return rows
  }
}

module.exports = new FunilChatbotRepository()