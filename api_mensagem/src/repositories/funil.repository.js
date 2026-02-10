//src/repositories/funil.repository.js
const db = require('../config/db');

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
}

module.exports = new FunilRepository()