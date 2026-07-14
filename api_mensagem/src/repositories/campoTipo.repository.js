// src/repositories/campoTipo.repository.js
const db = require('../config/db')

class CampoTipoRepository {
  async listar() {
    const { rows } = await db.query(`
      SELECT
        cd_campo_tipo,
        ds_campo_tipo,
        gn_campo_erro
      FROM tbl_campo_tipo
      ORDER BY cd_campo_tipo
    `)
    return rows
  }
}

module.exports = new CampoTipoRepository()