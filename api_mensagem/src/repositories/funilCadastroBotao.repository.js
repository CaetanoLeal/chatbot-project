//src/repositories/funilCadastroBotao.repository.js
const { v4: uuid } = require('uuid')

class FunilCadastroBotaoRepository {
  async criar(client, data) {
    
    await client.query(`
      INSERT INTO tbl_funil_cadastro_botao
      (id_funil_cadastro_botao, id_funil_cadastro, cd_botao, ds_botao, cd_mensagem_destino)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      uuid(),
      data.id_funil_cadastro,
      data.cd_botao,
      data.ds_botao,
      data.cd_mensagem_destino
    ])
  }
}

module.exports = new FunilCadastroBotaoRepository()