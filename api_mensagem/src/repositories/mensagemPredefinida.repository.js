// repository/MensagemPredefinidaRepository.js
"use strict"

const db = require("../config/db")

async function listar() {
  const { rows } = await db.query(
    `
    SELECT id_atalho, no_atalho, ds_atalho
      FROM tbl_atalho
     ORDER BY dh_inclusao ASC
    `
  )

  return rows
}

async function buscarPorId(id_mensagem_predefinida) {
  const { rows } = await db.query(
    `
    SELECT id_atalho, no_atalho, ds_atalho
      FROM tbl_atalho
     WHERE id_atalho = $1
     LIMIT 1
    `,
    [id_mensagem_predefinida]
  )

  return rows[0] ?? null
}

async function criar(no_atalho, ds_atalho) {
  const { rows } = await db.query(
    `
    INSERT INTO tbl_atalho
      (no_atalho, ds_atalho)
    VALUES
      ($1, $2)
    RETURNING id_atalho, no_atalho, ds_atalho
    `,
    [no_atalho, ds_atalho]
  )

  return rows[0]
}

async function atualizar(id_atalho, no_atalho, ds_atalho) {
  const { rows } = await db.query(
    `
    UPDATE tbl_atalho
       SET no_atalho = $1,
           ds_atalho = $2
     WHERE id_atalho = $3
    RETURNING id_atalho, no_atalho, ds_atalho
    `,
    [no_atalho, ds_atalho, id_atalho]
  )

  return rows[0] ?? null
}

async function excluir(id_mensagem_predefinida) {
  const { rows } = await db.query(
    `
    DELETE FROM tbl_atalho
     WHERE id_atalho = $1
    RETURNING id_atalho
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