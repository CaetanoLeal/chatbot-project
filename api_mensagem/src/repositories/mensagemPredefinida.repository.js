"use strict"

const db = require("../config/db")

async function listar() {
  const { rows } = await db.query(
    `
      SELECT
        id_atalho,
        no_atalho,
        ds_atalho,
        sg_atalho_tipo
      FROM tbl_atalho
      ORDER BY dh_inclusao ASC
    `
  )

  return rows
}

async function buscarPorId(id_mensagem_predefinida) {
  const { rows } = await db.query(
    `
      SELECT
        id_atalho,
        no_atalho,
        ds_atalho,
        sg_atalho_tipo
      FROM tbl_atalho
      WHERE id_atalho = $1
      LIMIT 1
    `,
    [id_mensagem_predefinida]
  )

  return rows[0] ?? null
}

async function criar(
  no_atalho,
  ds_atalho,
  sg_atalho_tipo
) {
  const { rows } = await db.query(
    `
      INSERT INTO tbl_atalho (
        no_atalho,
        ds_atalho,
        sg_atalho_tipo
      )
      VALUES ($1, $2, $3)
      RETURNING
        id_atalho,
        no_atalho,
        ds_atalho,
        sg_atalho_tipo
    `,
    [
      no_atalho,
      ds_atalho,
      sg_atalho_tipo
    ]
  )

  return rows[0]
}

async function atualizar(
  id_atalho,
  no_atalho,
  ds_atalho,
  sg_atalho_tipo
) {
  const { rows } = await db.query(
    `
      UPDATE tbl_atalho
         SET no_atalho = $1,
             ds_atalho = $2,
             sg_atalho_tipo = $3
       WHERE id_atalho = $4
      RETURNING
        id_atalho,
        no_atalho,
        ds_atalho,
        sg_atalho_tipo
    `,
    [
      no_atalho,
      ds_atalho,
      sg_atalho_tipo,
      id_atalho
    ]
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

async function listartipos() {
  const { rows } = await db.query(
    `
      SELECT
        sg_atalho_tipo,
        ds_atalho_tipo
      FROM tbl_atalho_tipo
      ORDER BY sg_atalho_tipo ASC
    `
  )

  return rows
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  listartipos
}