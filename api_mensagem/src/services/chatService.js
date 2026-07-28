// services/chatService.js
"use strict"

const db = require("../config/db")
const { v4: uuidv4 } = require("uuid")

const chatRepository = require("../repository/ChatRepository")
const atendenteRepository = require("../repositories/atendente.repository")
const funilHelper = require("../helpers/funil.helper")
const { sendWhatsAppMessage, sendTelegramMessage } = require("./sendMessage")

/* ============================================================
   (mantido) — cria/recupera chat quando chega mensagem nova
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
    `
    INSERT INTO tbl_chat
      (id_chat, id_utilizador, cd_provider, id_instancia,
       sg_chat_status, nao_lidas, dt_created_at, dt_updated_at)
    VALUES
      ($1, $2, $3, $4, 'C', 0, NOW(), NOW())
    `,
    [idChat, idUtilizador, cdProvider, idInstancia]
  )

  return idChat
}

/* ============================================================
   (mantido, com pequeno acréscimo) — salva mensagem unificada.
   idAtendente é a única "amarração" que temos entre uma
   mensagem e quem respondeu — é ela que o resto do sistema
   usa pra descobrir "quem está atendendo esse chat agora".
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
      idAtendente,
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
   listagem / detalhes — delega pro repository já com os
   novos campos (setor derivado, atendente derivado, ordenação
   por pendência)
   ============================================================ */
async function listChats() {
  return chatRepository.listChats()
}

async function getMessagesByChat(idChat) {
  return chatRepository.getMessagesByChat(idChat)
}

/* ============================================================
   (mantido)
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
   NOVO — Finalizar atendimento (botão "Finalizar" na tela).
   Muda tbl_chat.sg_chat_status para 'A' e sincroniza o motor
   do funil (tbl_funil_utilizador) para o mesmo estado.
   ============================================================ */
async function finalizarAtendimento({ idChat }) {
  const chat = await chatRepository.getChatById(idChat)
  if (!chat) {
    throw new Error("Chat não encontrado")
  }

  await chatRepository.finalizarChat(idChat)

  if (chat.id_funil && chat.id_utilizador) {
    await funilHelper.definirStatusManual({
      idUtilizador: chat.id_utilizador,
      idFunil: chat.id_funil,
      status: funilHelper.CHAT_STATUS.ABERTO, // 'A'
    })
  }
}

/* ============================================================
   NOVO — Envio de mensagem pelo atendente (caixa de texto do
   painel). Valida se o atendente é capacitado pro setor atual
   do chat (via tbl_atendente_setor), detecta o provider,
   concatena a assinatura, envia pelo canal certo, salva no
   histórico (com id_atendente, que é o que "marca" o chat como
   atendido por ele) e libera o funil de PENDENTE -> HUMANO.
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

    // Regra pedida: só quem é capacitado pro setor pode atender o chamado
    const capacitado = await atendenteRepository.verificarCapacitacaoSetor(idAtendente, chat.id_setor)
    if (!capacitado) {
      throw new Error(
        `${nomeAtendente} não está habilitado a atender o setor deste chat`
      )
    }
  }

  const mensagemFinal = `${texto}\n\n_${nomeAtendente}_`

  if (chat.cd_provider === 1) {
    // whatsapp
    const telefone = chat.nu_telefone || chat.cd_whatsapp
    if (!telefone) throw new Error("Chat sem telefone de WhatsApp cadastrado")
    if (!chat.no_instancia) throw new Error("Chat sem instância de WhatsApp vinculada")

    await sendWhatsAppMessage({
      telefone,
      message: mensagemFinal,
      instanceName: chat.no_instancia,
    })
  } else if (chat.cd_provider === 2) {
    // telegram
    if (!chat.cd_telegram) throw new Error("Chat sem identificador de Telegram cadastrado")

    await sendTelegramMessage({
      userId: chat.cd_telegram,
      message: mensagemFinal,
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
    conteudo: mensagemFinal,
    tipo: "text",
    payload: null,
    dhEnvio: new Date(),
    idAtendente: idAtendente || null,
  })

  // Regra do backend: mensagem from_me tira o chat de PENDENTE e
  // coloca em HUMANO (ver funil.helper.js -> verificarRespostaHumanaPendente)
  if (chat.id_funil && chat.id_utilizador) {
    await funilHelper.verificarRespostaHumanaPendente({
      idUtilizador: chat.id_utilizador,
      idFunil: chat.id_funil,
    })
  }

  return {
    id_mensagem: idMensagem,
    ds_conteudo: mensagemFinal,
    no_atendente: nomeAtendente,
  }
}

module.exports = {
  getOrCreateChat,
  saveUnifiedMessage,
  listChats,
  getMessagesByChat,
  updateChatContactInfo,
  updateChatStatus,
  getChatStatus,
  finalizarAtendimento,
  enviarMensagemAtendente,
}