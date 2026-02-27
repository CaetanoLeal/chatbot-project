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
    (id_chat, id_utilizador, cd_provider, id_instancia)
    VALUES ($1,$2,$3,$4)
    `,
    [idChat, idUtilizador, cdProvider, idInstancia]
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
    (id_mensagem, id_chat, cd_provider,
     id_mensagem_externa,
     from_me, ds_conteudo, ds_tipo,
     ds_payload, dh_envio)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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

  // Atualiza resumo do chat
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

//  LISTAR CHATS
async function listChats() {
  const { rows } = await db.query(`
    SELECT 
      c.*,
      u.no_utilizador,
      u.nu_telefone,
      p.ds_provider
    FROM tbl_chat c
    LEFT JOIN tbl_utilizador u 
      ON u.id_utilizador = c.id_utilizador
    LEFT JOIN tbl_provider p
      ON p.cd_provider = c.cd_provider
    ORDER BY c.dh_ultima_mensagem DESC NULLS LAST
  `)

  return rows
}

//  LISTAR MENSAGENS DO CHAT
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

module.exports = {
  getOrCreateChat,
  saveUnifiedMessage,
  listChats,
  getMessagesByChat
}