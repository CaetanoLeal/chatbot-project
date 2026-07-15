// src/repositories/funilCadastro.repository.js
const { v4: uuid } = require('uuid')

class FunilCadastroRepository {
  /**
   * @param {object} client - conexão/transação (db.query ou client.query)
   * @param {object} data
   */
  async criar(client, data) {
    const id = uuid()

    await client.query(
      `
      INSERT INTO tbl_funil_cadastro
        (id_funil_cadastro, id_funil, cd_mensagem, ds_mensagem,
         cd_mensagem_destino, is_aguardar, is_finalizar,
         id_setor, id_campo, pos_x, pos_y)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
        data.pos_x ?? null,
        data.pos_y ?? null,
      ]
    )

    return id
  }

  /** Remove todas as mensagens de cadastro de um funil (usado na
   *  estratégia "replace-all" do salvarEstrutura). Os botões são
   *  removidos em cascata pela FK (ver funilCadastroBotao). */
  async removerPorFunil(client, id_funil) {
    await client.query(`DELETE FROM tbl_funil_cadastro WHERE id_funil = $1`, [id_funil])
  }

  async listarCampos(id_funil) {
    const db = require('../config/db')
    const { rows } = await db.query(
      `
      SELECT *
      FROM tbl_funil_cadastro
      WHERE id_funil = $1
      ORDER BY cd_mensagem
      `,
      [id_funil]
    )
    return rows
  }
}

module.exports = new FunilCadastroRepository()