//src/models/InstanceModel.js
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

async function saveOrUpdateInstance(data) {
  const {
    no_instancia,
    cd_provider,
    cd_status,
    session_string,
    nu_telefone,
    ds_webhook,
    ds_foto_perfil,
    ds_auth_path
  } = data

  // verifica se já existe
  const existing = await db.query(
    `SELECT id_instancia FROM tbl_instancia WHERE no_instancia = $1`,
    [no_instancia]
  )

  if (existing.rows.length > 0) {
    // UPDATE
    await db.query(
      `
      UPDATE tbl_instancia
      SET 
        cd_provider = $2,
        cd_status = $3,
        session_string = $4,
        nu_telefone = $5,
        ds_webhook = $6,
        ds_foto_perfil = $7,
        ds_auth_path = $8,
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
        ds_auth_path
      ]
    )

    return { updated: true }
  }

  // INSERT
  await db.query(
    `
    INSERT INTO tbl_instancia (
      no_instancia,
      cd_provider,
      cd_status,
      session_string,
      nu_telefone,
      ds_webhook,
      ds_foto_perfil,
      ds_auth_path
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    `,
    [
      no_instancia,
      cd_provider,
      cd_status,
      session_string,
      nu_telefone,
      ds_webhook,
      ds_foto_perfil,
      ds_auth_path
    ]
  )

  return { created: true }
}

module.exports = {
  saveOrUpdateInstance,
  STATUS,
  PROVIDER
}