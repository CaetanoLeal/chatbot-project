/**
 * funil.helper.js
 *
 * Motor do funil multicanal (WhatsApp + Telegram)
 *
 * Modelagem central:
 *   tbl_funil
 *     └── tbl_funil_mensagem          (cd_mensagem é o código de posição)
 *           ├── tbl_funil_cadastro    (mensagens com botões de seleção)
 *           │     └── tbl_funil_cadastro_botao
 *           ├── tbl_funil_chatbot     (mensagens do chatbot com botões)
 *           │     └── tbl_funil_chatbot_botao
 *           └── tbl_funil_cadastro_resposta  (respostas livres + campo personalizado)
 *
 * Estado do utilizador: tbl_funil_utilizador.cd_mensagem
 * Estado do chat:       tbl_chat.sg_chat_status
 *   C = cadastro (aguardando botão)
 *   B = chatbot  (aguardando botão)
 *   W = aguardando resposta livre (is_aguardar = true)
 *   A = atendimento humano
 *   I = inativo
 *   P = pendente
 *   F = finalizado
 */

"use strict"

const db    = require("../config/db")
const logger = require("../../logger")
const { v4: uuidv4 } = require("uuid")
const { FUNIL_EXPIRACAO_MIN } = require("../constants/chatbot.constants")

/* ============================================================
   TIPOS DE MENSAGEM
   ============================================================ */
const TIPO = Object.freeze({
  CADASTRO          : "CADASTRO",
  CADASTRO_RESPOSTA : "CADASTRO_RESPOSTA",
  CHATBOT           : "CHATBOT",
})

/* ============================================================
   STATUS DO CHAT
   ============================================================ */
const CHAT_STATUS = Object.freeze({
  CADASTRO   : "C",   // aguardando seleção de botão (fluxo cadastro)
  CHATBOT    : "B",   // aguardando seleção de botão (fluxo chatbot)
  AGUARDANDO : "W",   // aguardando resposta livre (is_aguardar = true)
  HUMANO     : "A",   // atendimento humano
  INATIVO    : "I",
  PENDENTE   : "P",
  FINALIZADO : "F",
})

/* ============================================================
   UTILITÁRIOS DE IDENTIFICAÇÃO
   ============================================================ */

/**
 * Extrai número limpo do WhatsApp a partir do JID.
 * Ex: "5585999990000@s.whatsapp.net" → "5585999990000"
 */
function extrairNumeroWhatsapp({ jid, jidAlt, raw } = {}) {
  const candidatos = [
    jidAlt,
    jid,
    raw?.key?.participant,
    raw?.key?.remoteJid,
  ]

  for (const item of candidatos) {
    if (typeof item === "string" && item.includes("@s.whatsapp.net")) {
      return item.split("@")[0].split(":")[0]
    }
  }

  for (const item of candidatos) {
    if (typeof item === "string" && item.includes("@")) {
      return item.split("@")[0].split(":")[0]
    }
  }

  return null
}

/**
 * Extrai o ID numérico do utilizador Telegram.
 */
function extrairIdentificadorTelegram(msg) {
  return (
    msg?.fromId?.userId?.toString() ||
    msg?.peerId?.userId?.toString() ||
    null
  )
}

/**
 * Retorna true se algum dos JIDs for status@broadcast.
 */
function isStatusBroadcast(...jids) {
  return jids.some(
    jid => typeof jid === "string" && jid.includes("status@broadcast")
  )
}

/* ============================================================
   UTILIZADOR
   ============================================================ */

/**
 * Busca ou cria um utilizador na base.
 * Passa cdTelegram OU cdWhatsapp, nunca os dois.
 */
async function getOrCreateUtilizador({ cdTelegram, cdWhatsapp, telefone, nome }) {
  const campo = cdTelegram ? "cd_telegram" : "cd_whatsapp"
  const valor = cdTelegram ?? cdWhatsapp

  const { rows } = await db.query(
    `SELECT id_utilizador FROM tbl_utilizador WHERE ${campo} = $1 LIMIT 1`,
    [valor]
  )

  if (rows.length > 0) return rows[0].id_utilizador

  const idUtilizador = uuidv4()

  await db.query(
    `INSERT INTO tbl_utilizador
       (id_utilizador, no_utilizador, nu_telefone, cd_whatsapp, cd_telegram)
     VALUES ($1, $2, $3, $4, $5)`,
    [idUtilizador, nome ?? null, telefone ?? null, cdWhatsapp ?? null, cdTelegram ?? null]
  )

  logger.info(`🆕 Utilizador criado (${idUtilizador})`)
  return idUtilizador
}

/* ============================================================
   ESTADO DO CHAT
   ============================================================ */

async function getChatStatus(idChat) {
  const { rows } = await db.query(
    `SELECT sg_chat_status FROM tbl_chat WHERE id_chat = $1 LIMIT 1`,
    [idChat]
  )
  return rows[0]?.sg_chat_status ?? null
}

async function updateChatStatus({ idChat, idUtilizador, status }) {
  if (idChat) {
    await db.query(
      `UPDATE tbl_chat SET sg_chat_status = $1 WHERE id_chat = $2`,
      [status, idChat]
    )
  } else if (idUtilizador) {
    // fallback legado — prefira sempre usar idChat
    await db.query(
      `UPDATE tbl_chat SET sg_chat_status = $1 WHERE id_utilizador = $2`,
      [status, idUtilizador]
    )
  }
}

/* ============================================================
   FUNIL UTILIZADOR
   ============================================================ */

async function hasFunilUtilizador(idUtilizador, idFunil) {
  const { rows } = await db.query(
    `SELECT 1 FROM tbl_funil_utilizador
      WHERE id_utilizador = $1 AND id_funil = $2 LIMIT 1`,
    [idUtilizador, idFunil]
  )
  return rows.length > 0
}

/**
 * Cria o registro do utilizador no funil, posicionado na mensagem 1.
 * Define o status do chat como CADASTRO (C).
 */
async function createFunilUtilizador(idUtilizador, idFunil, idChat) {
  const now = new Date()
  const exp = new Date(now.getTime() + FUNIL_EXPIRACAO_MIN * 60_000)

  await db.query(
    `INSERT INTO tbl_funil_utilizador
       (id_funil_utilizador, id_funil, id_utilizador,
        cd_mensagem, cd_mensagem_cadastro, cd_mensagem_chatbot,
        dh_mensagem, dh_expiracao)
     VALUES ($1, $2, $3, 1, 1, 0, $4, $5)
     ON CONFLICT (id_utilizador, id_funil) DO UPDATE
       SET cd_mensagem = 1,
           dh_mensagem = EXCLUDED.dh_mensagem,
           dh_expiracao = EXCLUDED.dh_expiracao`,
    [uuidv4(), idFunil, idUtilizador, now, exp]
  )

  await updateChatStatus({ idChat, status: CHAT_STATUS.CADASTRO })
}

/**
 * Retorna o cd_mensagem atual do utilizador neste funil.
 */
async function getEstadoConversa(idUtilizador, idFunil) {
  const { rows } = await db.query(
    `SELECT cd_mensagem FROM tbl_funil_utilizador
      WHERE id_utilizador = $1 AND id_funil = $2 LIMIT 1`,
    [idUtilizador, idFunil]
  )
  return rows[0]?.cd_mensagem ?? null
}

/**
 * Avança o ponteiro do utilizador para um novo cd_mensagem.
 */
async function atualizarEstadoConversa(idUtilizador, idFunil, cdMensagem) {
  await db.query(
    `UPDATE tbl_funil_utilizador
        SET cd_mensagem = $1, dh_mensagem = NOW()
      WHERE id_utilizador = $2 AND id_funil = $3`,
    [cdMensagem, idUtilizador, idFunil]
  )
}

/* ============================================================
   NÚCLEO: BUSCA DE MENSAGEM
   ============================================================
   Toda busca passa OBRIGATORIAMENTE por tbl_funil_mensagem.
   O JOIN garante que id_funil e cd_mensagem estejam corretos.
   ============================================================ */

/**
 * Resolve o tipo de uma mensagem destino.
 * Retorna "CADASTRO" | "CHATBOT" | "CADASTRO_RESPOSTA" | null
 *
 * Usado para decidir qual status de chat aplicar após avançar.
 */
async function getTipoMensagem(idFunil, cdMensagem) {
  // 1. tbl_funil_chatbot via join
  const rChatbot = await db.query(
    `SELECT 1
       FROM tbl_funil_chatbot fc
       JOIN tbl_funil_mensagem fm ON fm.id_funil_mensagem = fc.id_funil_mensagem
      WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
      LIMIT 1`,
    [idFunil, cdMensagem]
  )
  if (rChatbot.rows.length > 0) return TIPO.CHATBOT

  // 2. tbl_funil_cadastro via join
  const rCadastro = await db.query(
    `SELECT 1
       FROM tbl_funil_cadastro fc
       JOIN tbl_funil_mensagem fm ON fm.id_funil_mensagem = fc.id_funil_mensagem
      WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
      LIMIT 1`,
    [idFunil, cdMensagem]
  )
  if (rCadastro.rows.length > 0) return TIPO.CADASTRO

  // 3. tbl_funil_cadastro_resposta via join
  const rResp = await db.query(
    `SELECT 1
       FROM tbl_funil_cadastro_resposta fcr
       JOIN tbl_funil_mensagem fm ON fm.id_funil_mensagem = fcr.id_funil_mensagem
      WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
      LIMIT 1`,
    [idFunil, cdMensagem]
  )
  if (rResp.rows.length > 0) return TIPO.CADASTRO_RESPOSTA

  return null
}

/**
 * Busca a mensagem completa (texto + botões) a partir do funil e cd_mensagem.
 *
 * Retorna:
 * {
 *   tipo        : "CADASTRO" | "CHATBOT" | "CADASTRO_RESPOSTA"
 *   textoFinal  : string
 *   possuiBotoes: boolean
 *   isAguardar  : boolean   (true = aguarda resposta livre)
 *   idRegistro  : string    (id_funil_cadastro | id_funil_chatbot | id_funil_cadastro_resposta)
 *   cdMensagem  : number
 * }
 */
async function getMensagemFunil({ idFunil, cdMensagem }) {
  /* ---- CHATBOT ---- */
  const rChatbot = await db.query(
    `SELECT fc.id_funil_chatbot AS id_registro,
            fc.ds_mensagem,
            fc.cd_mensagem_destino,
            fc.is_aguardar,
            fm.cd_mensagem
       FROM tbl_funil_chatbot fc
       JOIN tbl_funil_mensagem fm ON fm.id_funil_mensagem = fc.id_funil_mensagem
      WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
      LIMIT 1`,
    [idFunil, cdMensagem]
  )

  if (rChatbot.rows.length > 0) {
    const reg = rChatbot.rows[0]

    const { rows: botoes } = await db.query(
      `SELECT cd_botao, ds_botao
         FROM tbl_funil_chatbot_botao
        WHERE id_funil_chatbot = $1
        ORDER BY cd_botao`,
      [reg.id_registro]
    )

    return _montarRetorno({
      tipo       : TIPO.CHATBOT,
      registro   : reg,
      botoes,
      cdMensagem,
    })
  }

  /* ---- CADASTRO ---- */
  const rCadastro = await db.query(
    `SELECT fc.id_funil_cadastro AS id_registro,
            fc.ds_mensagem,
            fc.cd_mensagem_destino,
            fc.is_aguardar,
            fm.cd_mensagem
       FROM tbl_funil_cadastro fc
       JOIN tbl_funil_mensagem fm ON fm.id_funil_mensagem = fc.id_funil_mensagem
      WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
      LIMIT 1`,
    [idFunil, cdMensagem]
  )

  if (rCadastro.rows.length > 0) {
    const reg = rCadastro.rows[0]

    const { rows: botoes } = await db.query(
      `SELECT cd_botao, ds_botao
         FROM tbl_funil_cadastro_botao
        WHERE id_funil_cadastro = $1
        ORDER BY cd_botao`,
      [reg.id_registro]
    )

    return _montarRetorno({
      tipo       : TIPO.CADASTRO,
      registro   : reg,
      botoes,
      cdMensagem,
    })
  }

  /* ---- CADASTRO_RESPOSTA ---- */
  const rResp = await db.query(
    `SELECT fcr.id_funil_cadastro_resposta AS id_registro,
            fcr.ds_mensagem,
            fcr.cd_mensagem_destino,
            fcr.id_campo_personalizado,
            fm.cd_mensagem
       FROM tbl_funil_cadastro_resposta fcr
       JOIN tbl_funil_mensagem fm ON fm.id_funil_mensagem = fcr.id_funil_mensagem
      WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
      LIMIT 1`,
    [idFunil, cdMensagem]
  )

  if (rResp.rows.length > 0) {
    const reg = rResp.rows[0]
    return {
      tipo              : TIPO.CADASTRO_RESPOSTA,
      textoFinal        : reg.ds_mensagem,
      possuiBotoes      : false,
      isAguardar        : true,   // resposta livre = sempre aguarda
      idRegistro        : reg.id_registro,
      idCampoPersonalizado: reg.id_campo_personalizado,
      cdMensagemDestino : reg.cd_mensagem_destino,
      cdMensagem,
    }
  }

  logger.warn(`[FUNIL] Mensagem não encontrada: idFunil=${idFunil} cdMensagem=${cdMensagem}`)
  return null
}

/** Monta o objeto de retorno padrão (CADASTRO ou CHATBOT). */
function _montarRetorno({ tipo, registro, botoes, cdMensagem }) {
  let textoFinal = registro.ds_mensagem

  if (botoes.length > 0) {
    textoFinal += "\n\n" + botoes.map(b => `${b.cd_botao} - ${b.ds_botao}`).join("\n")
  }

  return {
    tipo,
    textoFinal,
    possuiBotoes      : botoes.length > 0,
    isAguardar        : registro.is_aguardar ?? false,
    cdMensagemDestino : registro.cd_mensagem_destino ?? null,
    idRegistro        : registro.id_registro,
    cdMensagem,
  }
}

/* ============================================================
   CAMPOS PERSONALIZADOS
   ============================================================ */

async function salvarCampoPersonalizado({ idFunilUtilizador, idCampoPersonalizado, valor }) {
  if (!idCampoPersonalizado) return

  await db.query(
    `INSERT INTO tbl_funil_utilizador_campo_personalizado
       (id_funil_utilizador_campo_personalizado,
        id_funil_utilizador, id_campo_personalizado,
        ds_valor, dh_cadastro, dh_atualizacao)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (id_funil_utilizador, id_campo_personalizado)
       DO UPDATE SET ds_valor = EXCLUDED.ds_valor, dh_atualizacao = NOW()`,
    [uuidv4(), idFunilUtilizador, idCampoPersonalizado, valor]
  )
}

async function getIdFunilUtilizador(idUtilizador, idFunil) {
  const { rows } = await db.query(
    `SELECT id_funil_utilizador FROM tbl_funil_utilizador
      WHERE id_utilizador = $1 AND id_funil = $2 LIMIT 1`,
    [idUtilizador, idFunil]
  )
  return rows[0]?.id_funil_utilizador ?? null
}

/* ============================================================
   MOTOR DO FUNIL
   ============================================================ */

/**
 * Envia a mensagem inicial do funil (cd_mensagem = 1).
 * Não precisa mais de getMensagemInicialComBotoes separado.
 */
async function getMensagemInicial(idFunil) {
  return getMensagemFunil({ idFunil, cdMensagem: 1 })
}

/**
 * Finaliza o funil: zera o ponteiro e marca o chat como finalizado.
 */
async function finalizarFunil({ idUtilizador, idFunil, idChat }) {
  await db.query(
    `UPDATE tbl_funil_utilizador
        SET cd_mensagem = 0, dh_mensagem = NOW()
      WHERE id_utilizador = $1 AND id_funil = $2`,
    [idUtilizador, idFunil]
  )
  await updateChatStatus({ idChat, status: CHAT_STATUS.FINALIZADO })
  logger.info(`[FUNIL] Finalizado — utilizador=${idUtilizador}`)
}

/**
 * Avança para a próxima mensagem:
 *  1. Atualiza cd_mensagem no estado do utilizador
 *  2. Busca a mensagem destino
 *  3. Atualiza o status do chat conforme o tipo encontrado
 *  4. Finaliza se não houver destino
 *
 * Retorna a mensagem destino ou null.
 */
async function avancarMensagem({
  idUtilizador,
  idFunil,
  idChat,
  cdMensagemDestino,
}) {
  if (!cdMensagemDestino) {
    await finalizarFunil({ idUtilizador, idFunil, idChat })
    return null
  }

  await atualizarEstadoConversa(idUtilizador, idFunil, cdMensagemDestino)

  const mensagem = await getMensagemFunil({ idFunil, cdMensagem: cdMensagemDestino })

  if (!mensagem) {
    await finalizarFunil({ idUtilizador, idFunil, idChat })
    return null
  }

  // Define o status correto do chat
  if (mensagem.tipo === TIPO.CHATBOT) {
    const novoStatus = mensagem.isAguardar
      ? CHAT_STATUS.AGUARDANDO
      : CHAT_STATUS.CHATBOT
    await updateChatStatus({ idChat, status: novoStatus })

  } else if (mensagem.tipo === TIPO.CADASTRO) {
    const novoStatus = mensagem.isAguardar
      ? CHAT_STATUS.AGUARDANDO
      : CHAT_STATUS.CADASTRO
    await updateChatStatus({ idChat, status: novoStatus })

  } else if (mensagem.tipo === TIPO.CADASTRO_RESPOSTA) {
    // Sempre aguardando (resposta livre)
    await updateChatStatus({ idChat, status: CHAT_STATUS.AGUARDANDO })
  }

  // Se chegou em mensagem sem botões e sem is_aguardar → finaliza
  if (!mensagem.possuiBotoes && !mensagem.isAguardar) {
    // Envia a mensagem final antes de fechar
    return { ...mensagem, deveFinalizarApos: true }
  }

  return mensagem
}

/* ============================================================
   PROCESSADORES DE RESPOSTA
   ============================================================ */

/**
 * Processa uma resposta de botão (status C ou B).
 * Funciona para CADASTRO e CHATBOT — a lógica é idêntica,
 * apenas a tabela de botões difere, e getMensagemFunil já resolve isso.
 */
async function processarRespostaBotao({
  idUtilizador,
  idFunil,
  idChat,
  texto,
  sendMessage,
}) {
  const cdBotao = parseInt(texto, 10)

  if (isNaN(cdBotao)) {
    await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
    return
  }

  // Estado atual
  const cdMensagemAtual = await getEstadoConversa(idUtilizador, idFunil)
  if (cdMensagemAtual === null) return

  // Busca o registro atual para obter o id do registro
  const mensagemAtual = await getMensagemFunil({ idFunil, cdMensagem: cdMensagemAtual })
  if (!mensagemAtual) return

  // Busca o botão pressionado
  let cdDestino = null

  if (mensagemAtual.tipo === TIPO.CHATBOT) {
    const { rows } = await db.query(
      `SELECT cd_mensagem_destino
         FROM tbl_funil_chatbot_botao
        WHERE id_funil_chatbot = $1 AND cd_botao = $2
        LIMIT 1`,
      [mensagemAtual.idRegistro, cdBotao]
    )
    cdDestino = rows[0]?.cd_mensagem_destino ?? null

  } else if (mensagemAtual.tipo === TIPO.CADASTRO) {
    const { rows } = await db.query(
      `SELECT cd_mensagem_destino
         FROM tbl_funil_cadastro_botao
        WHERE id_funil_cadastro = $1 AND cd_botao = $2
        LIMIT 1`,
      [mensagemAtual.idRegistro, cdBotao]
    )
    cdDestino = rows[0]?.cd_mensagem_destino ?? null
  }

  if (cdDestino === null) {
    await sendMessage("Opção inválida! Digite o número correspondente à opção desejada.")
    return
  }

  logger.info(`[FUNIL] Botão ${cdBotao} → destino ${cdDestino} (tipo: ${mensagemAtual.tipo})`)

  const proxima = await avancarMensagem({
    idUtilizador,
    idFunil,
    idChat,
    cdMensagemDestino: cdDestino,
  })

  if (proxima) {
    await sendMessage(proxima.textoFinal)

    if (proxima.deveFinalizarApos) {
      await finalizarFunil({ idUtilizador, idFunil, idChat })
    }
  }
}

/**
 * Processa uma resposta livre (status W — is_aguardar = true).
 * Salva o valor em campo personalizado se configurado.
 */
async function processarRespostaLivre({
  idUtilizador,
  idFunil,
  idChat,
  texto,
  sendMessage,
}) {
  const cdMensagemAtual = await getEstadoConversa(idUtilizador, idFunil)
  if (cdMensagemAtual === null) return

  const mensagemAtual = await getMensagemFunil({ idFunil, cdMensagem: cdMensagemAtual })
  if (!mensagemAtual) return

  // Salva campo personalizado se houver
  if (mensagemAtual.idCampoPersonalizado) {
    const idFunilUtilizador = await getIdFunilUtilizador(idUtilizador, idFunil)
    if (idFunilUtilizador) {
      await salvarCampoPersonalizado({
        idFunilUtilizador,
        idCampoPersonalizado: mensagemAtual.idCampoPersonalizado,
        valor: texto,
      })
      logger.info(`[FUNIL] Campo personalizado salvo — campo=${mensagemAtual.idCampoPersonalizado}`)
    }
  }

  // Determina o destino:
  // Para CADASTRO_RESPOSTA: usa cd_mensagem_destino do próprio registro
  // Para CADASTRO/CHATBOT com is_aguardar: usa cd_mensagem_destino do registro
  const cdDestino = mensagemAtual.cdMensagemDestino ?? null

  logger.info(`[FUNIL] Resposta livre recebida → destino ${cdDestino}`)

  const proxima = await avancarMensagem({
    idUtilizador,
    idFunil,
    idChat,
    cdMensagemDestino: cdDestino,
  })

  if (proxima) {
    await sendMessage(proxima.textoFinal)

    if (proxima.deveFinalizarApos) {
      await finalizarFunil({ idUtilizador, idFunil, idChat })
    }
  }
}

/* ============================================================
   ORQUESTRADOR PRINCIPAL
   ============================================================
   Centraliza toda a lógica de entrada de uma mensagem no funil.
   Chame isso no webhook para WhatsApp e Telegram.
   ============================================================ */

/**
 * Processa uma mensagem recebida dentro do contexto de um funil.
 *
 * @param {object} params
 * @param {string}   params.idUtilizador
 * @param {string}   params.idFunil
 * @param {string}   params.idChat
 * @param {string}   params.texto          - texto digitado pelo usuário
 * @param {Function} params.sendMessage    - async (text) => void
 */
async function processarMensagem({ idUtilizador, idFunil, idChat, texto, sendMessage }) {
  const possuiFunil = await hasFunilUtilizador(idUtilizador, idFunil)

  /* ---- Primeiro contato ---- */
  if (!possuiFunil) {
    await createFunilUtilizador(idUtilizador, idFunil, idChat)
    const mensagem = await getMensagemInicial(idFunil)
    if (mensagem) await sendMessage(mensagem.textoFinal)
    return
  }

  /* ---- Verifica status do chat ---- */
  const status = await getChatStatus(idChat)

  switch (status) {
    // Atendimento humano ou estados que não devem ser interrompidos pelo bot
    case CHAT_STATUS.HUMANO:
    case CHAT_STATUS.INATIVO:
    case CHAT_STATUS.PENDENTE:
    case CHAT_STATUS.FINALIZADO:
      return

    // Aguardando resposta livre
    case CHAT_STATUS.AGUARDANDO:
      await processarRespostaLivre({ idUtilizador, idFunil, idChat, texto, sendMessage })
      return

    // Aguardando seleção de botão (cadastro ou chatbot)
    case CHAT_STATUS.CADASTRO:
    case CHAT_STATUS.CHATBOT:
      await processarRespostaBotao({ idUtilizador, idFunil, idChat, texto, sendMessage })
      return

    // Estado desconhecido / null → reinicia o funil
    default:
      logger.warn(`[FUNIL] Status desconhecido (${status}) — reiniciando funil`)
      await createFunilUtilizador(idUtilizador, idFunil, idChat)
      const mensagem = await getMensagemInicial(idFunil)
      if (mensagem) await sendMessage(mensagem.textoFinal)
  }
}

/* ============================================================
   EXPORTS
   ============================================================ */
module.exports = {
  // Identificação
  extrairNumeroWhatsapp,
  extrairIdentificadorTelegram,
  isStatusBroadcast,

  // Utilizador
  getOrCreateUtilizador,

  // Chat
  getChatStatus,
  updateChatStatus,
  CHAT_STATUS,

  // Funil
  hasFunilUtilizador,
  createFunilUtilizador,
  getEstadoConversa,
  getMensagemInicial,
  getMensagemFunil,
  getTipoMensagem,
  finalizarFunil,

  // Campos personalizados
  salvarCampoPersonalizado,
  getIdFunilUtilizador,

  // Motor principal — use este no webhook
  processarMensagem,
}