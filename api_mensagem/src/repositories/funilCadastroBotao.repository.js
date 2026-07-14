// src/repositories/funilCadastroBotao.repository.js
const { v4: uuid } = require('uuid')

class FunilCadastroBotaoRepository {
  async criar(client, data) {
    await client.query(
      `
      INSERT INTO tbl_funil_cadastro_botao
        (id_funil_cadastro_botao, id_funil_cadastro, cd_botao, ds_botao, cd_mensagem_destino)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [uuid(), data.id_funil_cadastro, data.cd_botao, data.ds_botao, data.cd_mensagem_destino ?? null]
    )
  }

  /** Remove todos os botões de todas as mensagens de cadastro de um
   *  funil. Precisa rodar ANTES de removerPorFunil() da mensagem,
   *  pois id_funil_cadastro_botao referencia id_funil_cadastro. */
  async removerPorFunil(client, id_funil) {
    await client.query(
      `
      DELETE FROM tbl_funil_cadastro_botao
      WHERE id_funil_cadastro IN (
        SELECT id_funil_cadastro FROM tbl_funil_cadastro WHERE id_funil = $1
      )
      `,
      [id_funil]
    )
  }
}

module.exports = new FunilCadastroBotaoRepository()