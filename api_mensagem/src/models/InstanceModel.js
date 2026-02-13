// src/models/InstanceModel.js
const db = require("../config/db")

const STATUS = {
  INATIVO: 1,
  ATIVO: 2,
  DESCONECTADO: 3
}

const PROVIDER = {
  WHATSAPP: 1,
  TELEGRAM: 2
}

/*
=====================================================
  BUSCAR POR NOME
=====================================================
*/
async function getByName(no_instancia) {
  const { rows } = await db.query(
    `SELECT * FROM tbl_instancia WHERE no_instancia = $1 LIMIT 1`,
    [no_instancia]
  )

  return rows[0] || null
}

/*
=====================================================
  BUSCAR FUNIL DA INSTÂNCIA
=====================================================
*/
async function getFunilByInstanceName(no_instancia) {
  const { rows } = await db.query(
    `SELECT id_funil FROM tbl_instancia WHERE no_instancia = $1 LIMIT 1`,
    [no_instancia]
  )

  return rows[0]?.id_funil || null
}

/*
=====================================================
  LISTAR INSTÂNCIAS
=====================================================
*/
async function listAll() {
  const { rows } = await db.query(`
    SELECT 
      i.*,
      p.ds_provider,
      s.ds_status
    FROM tbl_instancia i
    LEFT JOIN tbl_provider p ON p.cd_provider = i.cd_provider
    LEFT JOIN tbl_status s ON s.cd_status = i.cd_status
    ORDER BY i.dt_created_at DESC
  `)

  return rows
}

/*
=====================================================
  CREATE OU UPDATE
=====================================================
*/
async function saveOrUpdateInstance(data) {
  const {
    no_instancia,
    cd_provider,
    cd_status,
    session_string = null,
    nu_telefone = null,
    ds_webhook = null,
    ds_foto_perfil = null,
    ds_auth_path = null,
    id_funil = null
  } = data

  const existing = await getByName(no_instancia)

  if (existing) {
    await db.query(
      `
      UPDATE tbl_instancia
      SET 
        cd_provider = COALESCE($2, cd_provider),
        cd_status = COALESCE($3, cd_status),
        session_string = COALESCE($4, session_string),
        nu_telefone = COALESCE($5, nu_telefone),
        ds_webhook = COALESCE($6, ds_webhook),
        ds_foto_perfil = COALESCE($7, ds_foto_perfil),
        ds_auth_path = COALESCE($8, ds_auth_path),
        id_funil = COALESCE($9, id_funil),
        dt_update_at = NOW()
      WHERE no_instancia = $1
      `,
      [
        no_instancia,
        cd_provider,
        cd_status,
        session_string,
        nu_telefone,
        ds_webhook,
        ds_foto_perfil,
        ds_auth_path,
        id_funil
      ]
    )

    return { updated: true }
  }

  const { rows } = await db.query(
    `
    INSERT INTO tbl_instancia (
      no_instancia,
      cd_provider,
      cd_status,
      session_string,
      nu_telefone,
      ds_webhook,
      ds_foto_perfil,
      ds_auth_path,
      id_funil
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id_instancia
    `,
    [
      no_instancia,
      cd_provider,
      cd_status,
      session_string,
      nu_telefone,
      ds_webhook,
      ds_foto_perfil,
      ds_auth_path,
      id_funil
    ]
  )

  return {
    created: true,
    id_instancia: rows[0].id_instancia
  }
}

module.exports = {
  saveOrUpdateInstance,
  getFunilByInstanceName,
  getByName,
  listAll,
  STATUS,
  PROVIDER
}