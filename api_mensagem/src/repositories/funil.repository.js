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