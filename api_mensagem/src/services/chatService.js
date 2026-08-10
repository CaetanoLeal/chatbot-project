// services/chatService.js
"use strict"

const db = require("../config/db")
const { v4: uuidv4 } = require("uuid")

const chatRepository = require("../repositories/ChatRepository")
const atendenteRepository = require("../repositories/atendente.repository")
const funilHelper = require("../helpers/funil.helper")
const { sendWhatsAppMessage, sendTelegramMessage } = require("./sendMessage")
const socketBus = require("../socket")

/* ============================================================
   cria/recupera chat quando chega mensagem nova
   ============================================================ */
async function getOrCreateChat({ idUtilizador, cdProvider, idInstancia }) {
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
    `INSERT INTO tbl_chat
       (id_chat, id_utilizador, cd_provider, id_instancia,
        sg_chat_status, nao_lidas, dt_created_at, dt_updated_at)
     VALUES
       ($1, $2, $3, $4, 'C', 0, NOW(), NOW())`,
    [idChat, idUtilizador, cdProvider, idInstancia]
  )

  const chatCompleto = await chatRepository.getChatById(idChat)
  if (chatCompleto) {
    socketBus.emit("NEW_CHAT", chatCompleto)
  }

  return idChat
}

/* ============================================================
   NOVO — busca chat existente sem criar (usado em message.sent)
   ============================================================ */
async function getChatExistente({ idUtilizador, cdProvider, idInstancia }) {
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
  return r.rows[0]?.id_chat ?? null
}

/* ============================================================
   salva mensagem unificada
   ============================================================ */
async function saveUnifiedMessage({
  idChat,
  cdProvider,
  idMensagemExterna,
  fromMe,
  conteudo,
  tipo,
  payload,
  dhEnvio,
  idAtendente = null,
}) {
  const idMensagem = uuidv4()

  await db.query(
    `
    INSERT INTO tbl_mensagem
      (id_mensagem, id_chat, cd_provider, id_mensagem_externa,
       from_me, ds_conteudo, ds_tipo, ds_payload, dh_envio, id_atendente)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
      dhEnvio,
      idAtendente || '00000000-0000-0000-0000-000000000000',
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
    [conteudo, dhEnvio, fromMe ? 0 : 1, idChat]
  )

  return idMensagem
}

/* ============================================================
   listagem / detalhes
   ============================================================ */
async function listChats() {
  return chatRepository.listChats()
}

async function getMessagesByChat(idChat, { limit, beforeDhEnvio, beforeIdMensagem } = {}) {
  return chatRepository.getMessagesByChat(idChat, { limit, beforeDhEnvio, beforeIdMensagem })
}

/* ============================================================
   atualiza foto/last seen — agora emite CHAT_CONTACT_UPDATED
   ============================================================ */
async function updateChatContactInfo({ idChat, fotoPerfil, lastSeen }) {
  await db.query(
    `
    UPDATE tbl_chat
       SET ds_foto_perfil = COALESCE($1, ds_foto_perfil),
           dh_last_seen = COALESCE($2, dh_last_seen),
           dt_updated_at = NOW()
     WHERE id_chat = $3
    `,
    [fotoPerfil, lastSeen, idChat]
  )

  if (fotoPerfil || lastSeen) {
    socketBus.emit("CHAT_CONTACT_UPDATED", {
      idChat,
      fotoPerfil: fotoPerfil || null,
      lastSeen: lastSeen || null,
    })
  }
}

async function updateChatStatus({ idChat, status }) {
  await db.query(
    `
    UPDATE tbl_chat
       SET sg_chat_status = $1,
           dt_updated_at = NOW()
     WHERE id_chat = $2
    `,
    [status, idChat]
  )
}

async function getChatStatus(idChat) {
  const r = await db.query(
    `SELECT sg_chat_status FROM tbl_chat WHERE id_chat = $1 LIMIT 1`,
    [idChat]
  )
  return r.rows.length === 0 ? null : r.rows[0].sg_chat_status
}

/* ============================================================
   Finalizar atendimento
   ============================================================ */
async function finalizarAtendimento({ idChat }) {
  const chat = await chatRepository.getChatById(idChat)
  if (!chat) {
    throw new Error("Chat não encontrado")
  }

  if (!chat.id_funil || !chat.id_utilizador) {
    throw new Error("Chat não está vinculado a um funil/utilizador")
  }

  await funilHelper.definirStatusManual({
    idUtilizador: chat.id_utilizador,
    idFunil: chat.id_funil,
    status: funilHelper.CHAT_STATUS.ABERTO,
  })
}

/* ============================================================
   Transferir atendimento
   ============================================================ */
async function transferirAtendimento({ idChat, idSetor }) {
  const chat = await chatRepository.getChatById(idChat)
  if (!chat) {
    throw new Error("Chat não encontrado")
  }

  if (!chat.id_funil || !chat.id_utilizador) {
    throw new Error("Chat não está vinculado a um funil/utilizador")
  }

  const setor = await chatRepository.getSetorById(idSetor)
  if (!setor) {
    throw new Error("Setor de destino não encontrado")
  }

  if (chat.id_setor === idSetor) {
    throw new Error(`Este chat já está no setor ${setor.no_setor}`)
  }

  await funilHelper.direcionarParaPendente({
    idUtilizador: chat.id_utilizador,
    idFunil: chat.id_funil,
    idSetor,
    noSetor: setor.no_setor,
  })

  return chatRepository.getChatById(idChat)
}

/* ============================================================
   Envio de mensagem pelo atendente
   ============================================================ */
async function enviarMensagemAtendente({ idChat, texto, idAtendente }) {
  const chat = await chatRepository.getChatById(idChat)
  if (!chat) {
    throw new Error("Chat não encontrado")
  }

  let nomeAtendente = "Atendimento"

  if (idAtendente) {
    const atendente = await atendenteRepository.buscarPorId(idAtendente)
    if (!atendente) {
      throw new Error("Atendente não encontrado")
    }
    nomeAtendente = atendente.no_atendente

    const capacitado = await atendenteRepository.verificarCapacitacaoSetor(idAtendente, chat.id_setor)
    if (!capacitado) {
      throw new Error(`${nomeAtendente} não está habilitado a atender o setor deste chat`)
    }
  }

  const mensagemParaEnvio = `Mensagem de *${nomeAtendente}*:\n ${texto}`

  if (chat.cd_provider === 1) {
    const telefone = chat.nu_telefone || chat.cd_whatsapp
    if (!telefone) throw new Error("Chat sem telefone de WhatsApp cadastrado")
    if (!chat.no_instancia) throw new Error("Chat sem instância de WhatsApp vinculada")

    await sendWhatsAppMessage({
      telefone,
      message: mensagemParaEnvio,
      instanceName: chat.no_instancia,
    })
  } else if (chat.cd_provider === 2) {
    if (!chat.cd_telegram) throw new Error("Chat sem identificador de Telegram cadastrado")

    await sendTelegramMessage({
      userId: chat.cd_telegram,
      message: mensagemParaEnvio,
      nome: nomeAtendente,
    })
  } else {
    throw new Error(`Provider do chat desconhecido (cd_provider=${chat.cd_provider})`)
  }

  const idMensagem = await saveUnifiedMessage({
    idChat,
    cdProvider: chat.cd_provider,
    idMensagemExterna: null,
    fromMe: true,
    conteudo: texto,
    tipo: "text",
    payload: null,
    dhEnvio: new Date(),
    idAtendente: idAtendente || null,
  })

  if (chat.id_funil && chat.id_utilizador) {
    await funilHelper.verificarRespostaHumanaPendente({
      idUtilizador: chat.id_utilizador,
      idFunil: chat.id_funil,
    })
  }

  return {
    id_mensagem: idMensagem,
    ds_conteudo: texto,
    no_atendente: nomeAtendente,
  }

  /* ============================================================
   Iniciar atendimento (mudar para Humano)
   ============================================================ */
  async function iniciarAtendimento({ idChat }) {
    const chat = await chatRepository.getChatById(idChat)
    if (!chat) {
      throw new Error("Chat não encontrado")
    }

    if (!chat.id_funil || !chat.id_utilizador) {
      throw new Error("Chat não está vinculado a um funil/utilizador")
    }

    await funilHelper.definirStatusManual({
      idUtilizador: chat.id_utilizador,
      idFunil: chat.id_funil,
      status: funilHelper.CHAT_STATUS.HUMANO, // Usando o enum do helper
    })
  }
}

module.exports = {
  getOrCreateChat,
  getChatExistente,
  saveUnifiedMessage,
  listChats,
  getMessagesByChat,
  updateChatContactInfo,
  updateChatStatus,
  getChatStatus,
  finalizarAtendimento,
  transferirAtendimento,
  enviarMensagemAtendente,
  iniciarAtendimento,
}