// src/repositories/funilIARepository.js
const db = require("../config/db");
const crypto = require("crypto");

/** Verifica se já existe uma IA ativa vinculada a este setor (opcionalmente ignorando um id, útil no update) */
async function findAtivoByIdSetor(idSetor, excludeId = null) {
  const query = `
    SELECT id_funil_ia, no_agente
    FROM tbl_funil_ia
    WHERE id_setor = $1
      AND (is_excluido IS NOT TRUE)
      ${excludeId ? "AND id_funil_ia != $2" : ""}
    LIMIT 1
  `;
  const values = excludeId ? [idSetor, excludeId] : [idSetor];
  const result = await db.query(query, values);
  return result.rows[0] || null;
}

async function create(data) {
  if (data.id_setor) {
    const existente = await findAtivoByIdSetor(data.id_setor);
    if (existente) {
      const error = new Error(
        `Este setor já possui uma IA vinculada (${existente.no_agente}). Cada setor pode ter apenas uma IA.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const idFunilIA = crypto.randomUUID();

  const query = `
    INSERT INTO tbl_funil_ia (
      id_funil_ia,
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
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
    )
    RETURNING *
  `;

  const values = [
    idFunilIA,
    data.id_funil_ia_modelo,
    data.no_agente,
    data.ds_funil,
    data.ds_personalidade,
    data.nu_temperature,
    data.nu_max_tokens,
    data.is_ativo,
    data.ds_fallback,
    data.is_human_handoff,
    data.id_setor || null
  ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        const error = new Error("Este setor já possui uma IA vinculada.");
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
  if (data.id_setor) {
    const existente = await findAtivoByIdSetor(data.id_setor, id);
    if (existente) {
      const error = new Error(
        `Este setor já possui uma IA vinculada (${existente.no_agente}). Cada setor pode ter apenas uma IA.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

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
      id_setor = $10,
      update_at = NOW()
    WHERE id_funil_ia = $11
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
    data.id_setor || null,
    id
  ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        const error = new Error("Este setor já possui uma IA vinculada.");
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

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
  findAtivoByIdSetor,
};