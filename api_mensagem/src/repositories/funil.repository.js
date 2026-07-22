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

  async deletar(id_funil) {
    console.log("ID recebido:", id_funil);
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Botões do cadastro
      await client.query(
        `
        DELETE FROM tbl_funil_cadastro_botao
        WHERE id_funil_cadastro IN (
          SELECT id_funil_cadastro
          FROM tbl_funil_cadastro
          WHERE id_funil = $1
        )
        `,
        [id_funil]
      );

      // Botões do chatbot
      await client.query(
        `
        DELETE FROM tbl_funil_chatbot_botao
        WHERE id_funil_chatbot IN (
          SELECT id_funil_chatbot
          FROM tbl_funil_chatbot
          WHERE id_funil = $1
        )
        `,
        [id_funil]
      );

      // Caso existam usuários vinculados ao funil
      await client.query(
        `
        DELETE FROM tbl_funil_utilizador_campo
        WHERE id_funil_utilizador IN (
          SELECT id_funil_utilizador
          FROM tbl_funil_utilizador
          WHERE id_funil = $1
        )
        `,
        [id_funil]
      );

      // Cadastro
      await client.query(
        `DELETE FROM tbl_funil_cadastro WHERE id_funil = $1`,
        [id_funil]
      );

      // Chatbot
      await client.query(
        `DELETE FROM tbl_funil_chatbot WHERE id_funil = $1`,
        [id_funil]
      );

      // Expiração
      await client.query(
        `DELETE FROM tbl_funil_expiracao WHERE id_funil = $1`,
        [id_funil]
      );

      // IA
      await client.query(
        `DELETE FROM tbl_funil_ia WHERE id_funil = $1`,
        [id_funil]
      );

      // Utilizadores do funil
      await client.query(
        `DELETE FROM tbl_funil_utilizador WHERE id_funil = $1`,
        [id_funil]
      );

      // Instâncias vinculadas
      await client.query(
        `DELETE FROM tbl_instancia WHERE id_funil = $1`,
        [id_funil]
      );

      // Funil
      const result = await client.query(
        `DELETE FROM tbl_funil WHERE id_funil = $1 RETURNING *`,
        [id_funil]
      );

      console.log(result.rowCount);
      console.log(result.rows);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async atualizarDadosGerais(id, dados) {
    const query = `
      UPDATE tbl_funil 
      SET no_funil = $1, ds_funil = $2 
      WHERE id_funil = $3 
      RETURNING *
    `;
    const values = [dados.name, dados.description, id];
    const { rows } = await db.query(query, values);
    return rows[0];
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