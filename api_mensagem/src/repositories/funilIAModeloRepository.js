// repositories/funilIAModeloRepository.js
const db = require("../config/db");

async function findAll() {

  const result = await db.query(`
    SELECT *
    FROM tbl_funil_ia_modelo
    ORDER BY ds_funil_ia_modelo
  `);

  return result.rows;
}

module.exports = {
  findAll
};