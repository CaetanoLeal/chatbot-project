// src/repositories/funil.repository.js
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

    // Mensagens de CADASTRO (cd_mensagem = 0 é sempre a inicial/boas-vindas)
    const { rows: cadastroRows } = await db.query(
      `
      SELECT FC.*, S.no_setor
      FROM tbl_funil_cadastro FC
      LEFT JOIN tbl_setor S ON S.id_setor = FC.id_setor
      WHERE FC.id_funil = $1
      ORDER BY FC.cd_mensagem
      `,
      [id_funil]
    )

    const cadastro = []
    for (const msg of cadastroRows) {
      const { rows: botoes } = await db.query(
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
        [msg.id_funil_cadastro]
      )

      cadastro.push({
        id: msg.id_funil_cadastro,
        cd_mensagem: msg.cd_mensagem,
        ds_mensagem: msg.ds_mensagem,
        cd_mensagem_destino: msg.cd_mensagem_destino,
        is_aguardar: msg.is_aguardar,
        is_finalizar: msg.is_finalizar,
        id_setor: msg.id_setor,
        no_setor: msg.no_setor,
        id_campo: msg.id_campo,
        pos_x: msg.pos_x,
        pos_y: msg.pos_y,
        botoes,
      })
    }

    // Mensagens de CHATBOT (cd_mensagem = 0 é sempre a inicial)
    const { rows: chatbotRows } = await db.query(
      `
      SELECT FC.*, S.no_setor
      FROM tbl_funil_chatbot FC
      LEFT JOIN tbl_setor S ON S.id_setor = FC.id_setor
      WHERE FC.id_funil = $1
      ORDER BY FC.cd_mensagem
      `,
      [id_funil]
    )

    const chatbot = []
    for (const msg of chatbotRows) {
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

      chatbot.push({
        id: msg.id_funil_chatbot,
        cd_mensagem: msg.cd_mensagem,
        ds_mensagem: msg.ds_mensagem,
        cd_mensagem_destino: msg.cd_mensagem_destino,
        is_aguardar: msg.is_aguardar,
        is_finalizar: msg.is_finalizar,
        id_setor: msg.id_setor,
        no_setor: msg.no_setor,
        id_campo: msg.id_campo,
        sg_chat_status: msg.sg_chat_status,
        pos_x: msg.pos_x,
        pos_y: msg.pos_y,
        botoes,
      })
    }

    return { ...funil, cadastro, chatbot }
  }

  async criar({ id_funil, name, description }) {
    const { rows } = await db.query(
      `
      INSERT INTO tbl_funil (id_funil, no_funil, ds_funil)
      VALUES ($1, $2, $3)
      RETURNING id_funil
      `,
      [id_funil, name, description]
    )

    const { funil_cadastro } = await db.query(
      `
      INSERT INTO tbl_funil_cadastro (id_funil, ds_mensagem)
      VALUES ($1, $@2)
      `,
      [id_funil, 'Mensagem de boas-vindas']
    )

    const { funil_chatbot } = await db.query(
      `
      INSERT INTO tbl_funil_chatbot (id_funil, ds_mensagem)
      VALUES ($1, $2)
      `,
      [id_funil, 'Mensagem de chatbot']
    )

    return rows[0]
  }
}

module.exports = new FunilRepository()