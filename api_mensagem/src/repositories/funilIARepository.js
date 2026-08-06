// src/repositories/funilIARepository.js
const db = require("../config/db");
const crypto = require("crypto");

/** Verifica se já existe uma IA ativa vinculada a este FUNIL + SETOR (opcionalmente ignorando um id, útil no update) */
async function findAtivoByIdSetor(idFunil, idSetor, excludeId = null) {
  const query = `
    SELECT id_funil_ia, no_agente
    FROM tbl_funil_ia
    WHERE id_funil = $1
      AND id_setor = $2
      AND (is_excluido IS NOT TRUE)
      ${excludeId ? "AND id_funil_ia != $3" : ""}
    LIMIT 1
  `;
  const values = excludeId ? [idFunil, idSetor, excludeId] : [idFunil, idSetor];
  const result = await db.query(query, values);
  return result.rows[0] || null;
}

async function create(data) {
  if (data.id_setor && data.id_funil) {
    const existente = await findAtivoByIdSetor(data.id_funil, data.id_setor);
    if (existente) {
      const error = new Error(
        `Este setor já possui uma IA vinculada neste funil (${existente.no_agente}). Cada combinação funil + setor pode ter apenas uma IA.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const idFunilIA = crypto.randomUUID();

  const query = `
    INSERT INTO tbl_funil_ia (
      id_funil_ia,
      id_funil,
      id_funil_ia_modelo,
      no_agente,
      ds_funil,
      ds_personalidade,
      nu_temperature,
      nu_max_tokens,
      is_ativo,
      ds_fallback,
      is_human_handoff,
      id_setor,
      created_at,
      update_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
    )
    RETURNING *
  `;

  const values = [
    idFunilIA,
    data.id_funil,
    data.id_funil_ia_modelo,
    data.no_agente,
    data.ds_funil,
    data.ds_personalidade,
    data.nu_temperature,
    data.nu_max_tokens,
    data.is_ativo,
    data.ds_fallback,
    data.is_human_handoff,
    data.id_setor || null,
  ];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      const error = new Error("Este setor já possui uma IA vinculada neste funil.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

async function findAll() {
  const result = await db.query(`
    SELECT
      fia.*,
      modelo.ds_funil_ia_modelo,
      f.no_funil
    FROM tbl_funil_ia fia
    LEFT JOIN tbl_funil_ia_modelo modelo
      ON modelo.id_funil_ia_modelo = fia.id_funil_ia_modelo
    LEFT JOIN tbl_funil f
      ON f.id_funil = fia.id_funil
  `);

  return result.rows;
}

async function findById(id) {
  const result = await db.query(`
    SELECT
      fia.*,
      modelo.ds_funil_ia_modelo,
      f.no_funil
    FROM tbl_funil_ia fia
    LEFT JOIN tbl_funil_ia_modelo modelo
      ON modelo.id_funil_ia_modelo = fia.id_funil_ia_modelo
    LEFT JOIN tbl_funil f
      ON f.id_funil = fia.id_funil
    WHERE fia.id_funil_ia = $1
  `, [id]);

  return result.rows[0];
}

async function update(id, data) {
  if (data.id_setor && data.id_funil) {
    const existente = await findAtivoByIdSetor(data.id_funil, data.id_setor, id);
    if (existente) {
      const error = new Error(
        `Este setor já possui uma IA vinculada neste funil (${existente.no_agente}). Cada combinação funil + setor pode ter apenas uma IA.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const query = `
    UPDATE tbl_funil_ia
    SET
      id_funil = $1,
      id_funil_ia_modelo = $2,
      no_agente = $3,
      ds_funil = $4,
      ds_personalidade = $5,
      nu_temperature = $6,
      nu_max_tokens = $7,
      is_ativo = $8,
      ds_fallback = $9,
      is_human_handoff = $10,
      id_setor = $11,
      update_at = NOW()
    WHERE id_funil_ia = $12
    RETURNING *
  `;

  const values = [
    data.id_funil,
    data.id_funil_ia_modelo,
    data.no_agente,
    data.ds_funil,
    data.ds_personalidade,
    data.nu_temperature,
    data.nu_max_tokens,
    data.is_ativo,
    data.ds_fallback,
    data.is_human_handoff,
    data.id_setor || null,
    id
  ];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      const error = new Error("Este setor já possui uma IA vinculada neste funil.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

async function remove(id) {
  await db.query(`
    DELETE FROM tbl_funil_ia
    WHERE id_funil_ia = $1
  `, [id]);

  return true;
}

async function findAllByFunil(idFunil) {
  const result = await db.query(`
    SELECT
      fia.*,
      modelo.ds_funil_ia_modelo,
      s.no_setor
    FROM tbl_funil_ia fia
    LEFT JOIN tbl_funil_ia_modelo modelo
      ON modelo.id_funil_ia_modelo = fia.id_funil_ia_modelo
    LEFT JOIN tbl_setor s
      ON s.id_setor = fia.id_setor
    WHERE fia.id_funil = $1
  `, [idFunil]);

  return result.rows;
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
  findAtivoByIdSetor,
  findAllByFunil,
};