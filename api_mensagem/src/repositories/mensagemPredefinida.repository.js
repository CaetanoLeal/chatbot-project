// repository/MensagemPredefinidaRepository.js
"use strict"

const db = require("../config/db")

async function listar() {
  const { rows } = await db.query(
    `
    SELECT id_mensagem_predefinida, ds_mensagem_predefinida
      FROM tbl_mensagem_predefinida
     ORDER BY ds_mensagem_predefinida ASC
    `
  )

  return rows
}

async function buscarPorId(id_mensagem_predefinida) {
  const { rows } = await db.query(
    `
    SELECT id_mensagem_predefinida, ds_mensagem_predefinida
      FROM tbl_mensagem_predefinida
     WHERE id_mensagem_predefinida = $1
     LIMIT 1
    `,
    [id_mensagem_predefinida]
  )

  return rows[0] ?? null
}

async function criar(ds_mensagem_predefinida) {
  const { rows } = await db.query(
    `
    INSERT INTO tbl_mensagem_predefinida
      (ds_mensagem_predefinida)
    VALUES
      ($1)
    RETURNING id_mensagem_predefinida, ds_mensagem_predefinida
    `,
    [ds_mensagem_predefinida]
  )

  return rows[0]
}

async function atualizar(id_mensagem_predefinida, ds_mensagem_predefinida) {
  const { rows } = await db.query(
    `
    UPDATE tbl_mensagem_predefinida
       SET ds_mensagem_predefinida = $1
     WHERE id_mensagem_predefinida = $2
    RETURNING id_mensagem_predefinida, ds_mensagem_predefinida
    `,
    [ds_mensagem_predefinida, id_mensagem_predefinida]
  )

  return rows[0] ?? null
}

async function excluir(id_mensagem_predefinida) {
  const { rows } = await db.query(
    `
    DELETE FROM tbl_mensagem_predefinida
     WHERE id_mensagem_predefinida = $1
    RETURNING id_mensagem_predefinida
    `,
    [id_mensagem_predefinida]
  )

  return rows[0] ?? null
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
}