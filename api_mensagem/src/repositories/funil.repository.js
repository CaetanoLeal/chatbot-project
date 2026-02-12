//src/repositories/funil.repository.js
const db = require('../config/db')

class FunilRepository {
  async listar() {
    const { rows } = await db.query(`
      SELECT
        id_funil AS id,
        no_funil AS name,
        ds_funil AS description
      FROM tbl_funil
      ORDER BY no_funil
    `)
    return rows
  }

  async buscarPorId(id_funil) {
    // 🔹 1. Buscar dados do funil
    const { rows: funilRows } = await db.query(
      `
      SELECT
        id_funil AS id,
        no_funil AS name,
        ds_funil AS description
      FROM tbl_funil
      WHERE id_funil = $1
      `,
      [id_funil]
    )

    if (funilRows.length === 0) return null

    const funil = funilRows[0]

    // 🔹 2. Buscar mensagem de boas-vindas
    const { rows: welcomeRows } = await db.query(
      `
      SELECT *
      FROM tbl_funil_cadastro
      WHERE id_funil = $1
      ORDER BY cd_mensagem
      LIMIT 1
      `,
      [id_funil]
    )

    let welcomeMessage = null

    if (welcomeRows.length > 0) {
      const welcome = welcomeRows[0]

      const { rows: botoesWelcome } = await db.query(
        `
        SELECT 
        id_funil_cadastro_botao AS id,
        cd_botao,
        ds_botao,
        cd_mensagem_destino
        FROM tbl_funil_cadastro_botao
        WHERE id_funil_cadastro = $1
        ORDER BY cd_botao
        `,
        [welcome.id_funil_cadastro]
      )

      welcomeMessage = {
        id: welcome.id_funil_cadastro,
        cd_mensagem: welcome.cd_mensagem,
        ds_mensagem: welcome.ds_mensagem,
        cd_mensagem_destino: welcome.cd_mensagem_destino,
        is_aguardar: welcome.is_aguardar,
        botoes: botoesWelcome,
      }
    }

    // 🔹 3. Buscar mensagens chatbot
    const { rows: messageRows } = await db.query(
      `
      SELECT *
      FROM tbl_funil_chatbot
      WHERE id_funil = $1
      ORDER BY cd_mensagem
      `,
      [id_funil]
    )

    const messages = []

    for (const msg of messageRows) {
      const { rows: botoes } = await db.query(
        `
        SELECT 
        id_funil_chatbot_botao AS id,
        cd_botao,
        ds_botao,
        cd_mensagem_destino
        FROM tbl_funil_chatbot_botao
        WHERE id_funil_chatbot = $1
        ORDER BY cd_botao
        `,
        [msg.id_funil_chatbot]
      )

      messages.push({
        id: msg.id_funil_chatbot,
        cd_mensagem: msg.cd_mensagem,
        ds_mensagem: msg.ds_mensagem,
        cd_mensagem_destino: msg.cd_mensagem_destino,
        is_aguardar: msg.is_aguardar,
        botoes,
      })
    }

    return {
      ...funil,
      welcomeMessage,
      messages,
    }
  }

  async criar({ name, description }) {
    const { rows } = await db.query(
      `
      INSERT INTO tbl_funil (no_funil, ds_funil)
      VALUES ($1, $2)
      RETURNING id_funil
      `,
      [name, description]
    )

    return rows[0]
  }
}

module.exports = new FunilRepository()