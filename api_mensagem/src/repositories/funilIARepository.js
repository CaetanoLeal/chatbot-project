//src/repositories/funilIARepository.js
const db = require("../config/db");
const crypto = require("crypto");

async function create(data) {

  const client = await db.connect();

  try {

    await client.query("BEGIN");

    const idFunil =
      crypto.randomUUID();

    const idFunilIA =
      crypto.randomUUID();

    /*
    =====================================
      INSERT TBL_FUNIL
    =====================================
    */

    await client.query(`
      INSERT INTO tbl_funil (
        id_funil,
        no_funil,
        ds_funil
      )
      VALUES ($1,$2,$3)
    `, [
      idFunil,
      data.no_funil,
      data.ds_funil
    ]);

    /*
    =====================================
      INSERT TBL_FUNIL_IA
    =====================================
    */

    const result = await client.query(`
      INSERT INTO tbl_funil_ia (
        id_funil_ia,
        id_funil_ia_modelo,
        id_funil,
        no_agente,
        ds_funil,
        ds_personalidade,
        nu_temperature,
        nu_max_tokens,
        is_ativo,
        ds_fallback,
        is_human_handoff,
        created_at,
        update_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()
      )
      RETURNING *
    `, [
      idFunilIA,
      data.id_funil_ia_modelo,
      idFunil,
      data.no_agente,
      data.ds_funil,
      data.ds_personalidade,
      data.nu_temperature,
      data.nu_max_tokens,
      data.is_ativo,
      data.ds_fallback,
      data.is_human_handoff
    ]);

    await client.query("COMMIT");

    return result.rows[0];

  } catch (err) {

    await client.query("ROLLBACK");

    throw err;

  } finally {

    client.release();
  }
}

async function findAll() {

  const result = await db.query(`
    SELECT
      fia.*,
      modelo.ds_funil_ia_modelo
    FROM tbl_funil_ia fia
    LEFT JOIN tbl_funil_ia_modelo modelo
      ON modelo.id_funil_ia_modelo = fia.id_funil_ia_modelo
  `);

  return result.rows;
}

async function findById(id) {

  const result = await db.query(`
    SELECT
      fia.*,
      modelo.ds_funil_ia_modelo
    FROM tbl_funil_ia fia
    LEFT JOIN tbl_funil_ia_modelo modelo
      ON modelo.id_funil_ia_modelo = fia.id_funil_ia_modelo
    WHERE fia.id_funil_ia = $1
  `, [id]);

  return result.rows[0];
}

async function update(id, data) {

  const query = `
    UPDATE tbl_funil_ia
    SET
      id_funil_ia_modelo = $1,
      no_agente = $2,
      ds_funil = $3,
      ds_personalidade = $4,
      nu_temperature = $5,
      nu_max_tokens = $6,
      is_ativo = $7,
      ds_fallback = $8,
      is_human_handoff = $9,
      update_at = NOW()
    WHERE id_funil_ia = $10
    RETURNING *
  `;

  const values = [
    data.id_funil_ia_modelo,
    data.no_agente,
    data.ds_funil,
    data.ds_personalidade,
    data.nu_temperature,
    data.nu_max_tokens,
    data.is_ativo,
    data.ds_fallback,
    data.is_human_handoff,
    id
  ];

  const result = await db.query(query, values);

  return result.rows[0];
}

async function remove(id) {

  await db.query(`
    DELETE FROM tbl_funil_ia
    WHERE id_funil_ia = $1
  `, [id]);

  return true;
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove
};