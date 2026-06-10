// src/services/chatService.js

const db = require("../config/db")
const { v4: uuidv4 } = require("uuid")

async function getOrCreateChat({
  idUtilizador,
  cdProvider,
  idInstancia
}) {

  const r = await db.query(
    `
    SELECT id_chat
    FROM tbl_chat
    WHERE id_utilizador = $1
      AND cd_provider = $2
      AND id_instancia = $3
    LIMIT 1
    `,
    [idUtilizador, cdProvider, idInstancia]
  )

  if (r.rows.length > 0) {
    return r.rows[0].id_chat
  }

  const idChat = uuidv4()

  await db.query(
    `
    INSERT INTO tbl_chat
    (
      id_chat,
      id_utilizador,
      cd_provider,
      id_instancia,
      sg_chat_status,
      nao_lidas,
      dt_created_at,
      dt_updated_at
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      'C',
      0,
      NOW(),
      NOW()
    )
    `,
    [
      idChat,
      idUtilizador,
      cdProvider,
      idInstancia
    ]
  )

  return idChat
}

async function saveUnifiedMessage({
  idChat,
  cdProvider,
  idMensagemExterna,
  fromMe,
  conteudo,
  tipo,
  payload,
  dhEnvio
}) {

  const idMensagem = uuidv4()

  await db.query(
    `
    INSERT INTO tbl_mensagem
    (
      id_mensagem,
      id_chat,
      cd_provider,
      id_mensagem_externa,
      from_me,
      ds_conteudo,
      ds_tipo,
      ds_payload,
      dh_envio
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9
    )
    `,
    [
      idMensagem,
      idChat,
      cdProvider,
      idMensagemExterna,
      fromMe,
      conteudo,
      tipo || "text",
      payload || null,
      dhEnvio
    ]
  )

  await db.query(
    `
    UPDATE tbl_chat
       SET ultima_mensagem = $1,
           dh_ultima_mensagem = $2,
           nao_lidas = nao_lidas + $3,
           dt_updated_at = NOW()
     WHERE id_chat = $4
    `,
    [
      conteudo,
      dhEnvio,
      fromMe ? 0 : 1,
      idChat
    ]
  )
}

async function listChats() {

  const { rows } = await db.query(`
    SELECT
      c.*,
      u.no_utilizador,
      u.nu_telefone,
      p.ds_provider,
      i.no_instancia
    FROM tbl_chat c
    LEFT JOIN tbl_utilizador u
      ON u.id_utilizador = c.id_utilizador
    LEFT JOIN tbl_provider p
      ON p.cd_provider = c.cd_provider
    LEFT JOIN tbl_instancia i
      ON i.id_instancia = c.id_instancia
    ORDER BY c.dh_ultima_mensagem DESC NULLS LAST
  `)

  return rows
}

async function getMessagesByChat(idChat) {

  const { rows } = await db.query(
    `
    SELECT *
    FROM tbl_mensagem
    WHERE id_chat = $1
    ORDER BY dh_envio ASC
    `,
    [idChat]
  )

  return rows
}

async function updateChatContactInfo({
  idChat,
  fotoPerfil,
  lastSeen
}) {

  await db.query(
    `
    UPDATE tbl_chat
       SET ds_foto_perfil = COALESCE($1, ds_foto_perfil),
           dh_last_seen = COALESCE($2, dh_last_seen),
           dt_updated_at = NOW()
     WHERE id_chat = $3
    `,
    [
      fotoPerfil,
      lastSeen,
      idChat
    ]
  )
}

async function updateChatStatus({
  idChat,
  status
}) {

  await db.query(
    `
    UPDATE tbl_chat
       SET sg_chat_status = $1,
           dt_updated_at = NOW()
     WHERE id_chat = $2
    `,
    [
      status,
      idChat
    ]
  )
}

async function getChatStatus(idChat) {

  const r = await db.query(
    `
    SELECT sg_chat_status
    FROM tbl_chat
    WHERE id_chat = $1
    LIMIT 1
    `,
    [idChat]
  )

  if (r.rows.length === 0) {
    return null
  }

  return r.rows[0].sg_chat_status
}

module.exports = {
  getOrCreateChat,
  saveUnifiedMessage,
  listChats,
  getMessagesByChat,
  updateChatContactInfo,
  updateChatStatus,
  getChatStatus
}