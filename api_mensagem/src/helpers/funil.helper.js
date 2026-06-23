// helpers/funil.helper.js
const db = require("../config/db")
const logger = require("../../logger")
const { v4: uuidv4 } = require("uuid")
const {
  DEFAULT_FUNIL_ID,
  FUNIL_EXPIRACAO_MIN
} = require("../constants/chatbot.constants.js")

/* ============================================================
   EXTRAÇÃO DE IDENTIFICADORES
   ============================================================ */

function extrairNumeroWhatsapp({ jid, jidAlt, raw }) {
  const candidatos = [jidAlt, jid, raw?.key?.participant, raw?.key?.remoteJid]

  for (const item of candidatos) {
    if (!item) continue
    if (item.includes("@s.whatsapp.net")) {
      return item.split("@")[0].split(":")[0]
    }
  }

  for (const item of candidatos) {
    if (!item) continue
    if (item.includes("@")) {
      return item.split("@")[0].split(":")[0]
    }
  }

  return null
}

function extrairIdentificadorTelegram(msg) {
  return (
    msg?.fromId?.userId?.toString() ||
    msg?.peerId?.userId?.toString() ||
    null
  )
}

function isStatusBroadcast(...jids) {
  return jids.some(
    jid => typeof jid === "string" && jid.includes("status@broadcast")
  )
}

/* ============================================================
   UTILIZADOR
   ============================================================ */

async function getOrCreateUtilizador({ cdTelegram, cdWhatsapp, telefone, nome }) {
  const campo = cdTelegram ? "cd_telegram" : "cd_whatsapp"
  const valor = cdTelegram || cdWhatsapp

  const rUser = await db.query(
    `SELECT id_utilizador FROM tbl_utilizador WHERE ${campo} = $1`,
    [valor]
  )

  if (rUser.rows.length > 0) return rUser.rows[0].id_utilizador

  const idUtilizador = uuidv4()
  await db.query(
    `INSERT INTO tbl_utilizador
     (id_utilizador, no_utilizador, nu_telefone, cd_whatsapp, cd_telegram)
     VALUES ($1,$2,$3,$4,$5)`,
    [idUtilizador, nome ?? null, telefone ?? null, cdWhatsapp ?? null, cdTelegram ?? null]
  )

  logger.info(`🆕 Utilizador criado (${idUtilizador})`)
  return idUtilizador
}

/* ============================================================
   ESTADO DA CONVERSA (tbl_funil_utilizador)
   ============================================================ */

async function hasFunilUtilizador(idUtilizador, idFunil) {
  const r = await db.query(
    `SELECT 1 FROM tbl_funil_utilizador
     WHERE id_utilizador = $1 AND id_funil = $2 LIMIT 1`,
    [idUtilizador, idFunil]
  )
  return r.rows.length > 0
}

async function createFunilUtilizador(idUtilizador, idFunil) {
  const now = new Date()
  const exp = new Date(now.getTime() + FUNIL_EXPIRACAO_MIN * 60000)

  await db.query(
    `INSERT INTO tbl_funil_utilizador
     (id_funil_utilizador, id_funil, id_utilizador, cd_mensagem,
      cd_mensagem_cadastro, cd_mensagem_chatbot, dh_mensagem, dh_expiracao)
     VALUES ($1,$2,$3,1,1,0,$4,$5)`,
    [uuidv4(), idFunil, idUtilizador, now, exp]
  )

  await updateChatStatus({ idUtilizador, status: "C" })
}

async function getEstadoConversa(idUtilizador, idFunil) {
  const r = await db.query(
    `SELECT cd_mensagem FROM tbl_funil_utilizador
     WHERE id_utilizador = $1 AND id_funil = $2 LIMIT 1`,
    [idUtilizador, idFunil]
  )
  if (r.rows.length === 0) return null
  return r.rows[0].cd_mensagem
}

async function atualizarEstadoConversa(idUtilizador, idFunil, cdMensagem) {
  await db.query(
    `UPDATE tbl_funil_utilizador
     SET cd_mensagem = $1, dh_mensagem = NOW()
     WHERE id_utilizador = $2 AND id_funil = $3`,
    [cdMensagem, idUtilizador, idFunil]
  )
}

/* ============================================================
   CAMPOS PERSONALIZADOS
   ============================================================ */

/**
 * Salva ou atualiza um valor de campo personalizado para o utilizador.
 */
async function salvarCampoPersonalizado(idUtilizador, idCampoPersonalizado, dsValor) {
  // Buscar o id_funil_utilizador
  const rFu = await db.query(
    `SELECT id_funil_utilizador FROM tbl_funil_utilizador
     WHERE id_utilizador = $1 LIMIT 1`,
    [idUtilizador]
  )

  if (rFu.rows.length === 0) {
    logger.warn(`salvarCampoPersonalizado: sem tbl_funil_utilizador para ${idUtilizador}`)
    return
  }

  const idFunilUtilizador = rFu.rows[0].id_funil_utilizador
  const now = new Date()

  // Upsert
  await db.query(
    `INSERT INTO tbl_funil_utilizador_campo_personalizado
       (id_funil_utilizador_campo_personalizado, id_funil_utilizador,
        id_campo_personalizado, ds_valor, dh_cadastro, dh_atualizacao)
     VALUES ($1,$2,$3,$4,$5,$5)
     ON CONFLICT (id_funil_utilizador, id_campo_personalizado)
     DO UPDATE SET ds_valor = EXCLUDED.ds_valor, dh_atualizacao = EXCLUDED.dh_atualizacao`,
    [uuidv4(), idFunilUtilizador, idCampoPersonalizado, dsValor, now]
  )

  logger.info(`💾 Campo ${idCampoPersonalizado} = "${dsValor}" salvo para ${idUtilizador}`)
}

/* ============================================================
   CHAT STATUS
   ============================================================ */

async function getChatStatus(idChat) {
  const r = await db.query(
    `SELECT sg_chat_status FROM tbl_chat WHERE id_chat = $1 LIMIT 1`,
    [idChat]
  )
  if (r.rows.length === 0) return null
  return r.rows[0].sg_chat_status
}

async function updateChatStatus({ idUtilizador, status }) {
  await db.query(
    `UPDATE tbl_chat SET sg_chat_status = $1 WHERE id_utilizador = $2`,
    [status, idUtilizador]
  )
}

async function finalizarChat({ idUtilizador, idFunil }) {
  await atualizarEstadoConversa(idUtilizador, idFunil, 0)
  await updateChatStatus({ idUtilizador, status: "F" })
  logger.info(`✅ Chat finalizado para utilizador ${idUtilizador}`)
}

/* ============================================================
   BUSCA DE MENSAGEM DO FUNIL
   Retorna: { tipo, textoFinal, possuiBotoes, idRegistro,
              idCampoPersonalizado (se for resposta) }
   ============================================================ */

async function getMensagemFunil({ idFunil, cdMensagem }) {
  /* ----------------------------------------------------------
     1. CHATBOT
  ---------------------------------------------------------- */
  let r = await db.query(
    `SELECT fm.id_funil_mensagem, fc.id_funil_chatbot AS id_registro, fc.ds_mensagem
     FROM tbl_funil_mensagem fm
     JOIN tbl_funil_chatbot fc ON fc.id_funil_mensagem = fm.id_funil_mensagem
     WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
     LIMIT 1`,
    [idFunil, cdMensagem]
  )

  if (r.rows.length > 0) {
    const { id_registro, ds_mensagem } = r.rows[0]

    const rBotoes = await db.query(
      `SELECT cd_botao, ds_botao FROM tbl_funil_chatbot_botao
       WHERE id_funil_chatbot = $1 ORDER BY cd_botao`,
      [id_registro]
    )

    let textoFinal = ds_mensagem
    if (rBotoes.rows.length > 0) {
      textoFinal += "\n\n" + rBotoes.rows.map(b => `${b.cd_botao} - ${b.ds_botao}`).join("\n")
    }

    return { tipo: "CHATBOT", textoFinal, possuiBotoes: rBotoes.rows.length > 0, idRegistro: id_registro }
  }

  /* ----------------------------------------------------------
     2. CADASTRO (com botões de escolha)
  ---------------------------------------------------------- */
  r = await db.query(
    `SELECT fm.id_funil_mensagem, fc.id_funil_cadastro AS id_registro, fc.ds_mensagem
     FROM tbl_funil_mensagem fm
     JOIN tbl_funil_cadastro fc ON fc.id_funil_mensagem = fm.id_funil_mensagem
     WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
     LIMIT 1`,
    [idFunil, cdMensagem]
  )

  if (r.rows.length > 0) {
    const { id_registro, ds_mensagem } = r.rows[0]

    const rBotoes = await db.query(
      `SELECT cd_botao, ds_botao FROM tbl_funil_cadastro_botao
       WHERE id_funil_cadastro = $1 ORDER BY cd_botao`,
      [id_registro]
    )

    let textoFinal = ds_mensagem
    if (rBotoes.rows.length > 0) {
      textoFinal += "\n\n" + rBotoes.rows.map(b => `${b.cd_botao} - ${b.ds_botao}`).join("\n")
    }

    return { tipo: "CADASTRO", textoFinal, possuiBotoes: rBotoes.rows.length > 0, idRegistro: id_registro }
  }

  /* ----------------------------------------------------------
     3. CADASTRO RESPOSTA (captura texto livre)
     — JOIN via tbl_funil_mensagem para garantir o id_funil correto
  ---------------------------------------------------------- */
  r = await db.query(
    `SELECT fcr.ds_mensagem, fcr.cd_mensagem_destino, fcr.id_campo_personalizado
     FROM tbl_funil_mensagem fm
     JOIN tbl_funil_cadastro_resposta fcr ON fcr.id_funil_mensagem = fm.id_funil_mensagem
     WHERE fm.id_funil = $1 AND fm.cd_mensagem = $2
     LIMIT 1`,
    [idFunil, cdMensagem]
  )

  if (r.rows.length > 0) {
    return {
      tipo: "CADASTRO_RESPOSTA",
      textoFinal: r.rows[0].ds_mensagem,
      possuiBotoes: false,
      cdMensagemDestino: r.rows[0].cd_mensagem_destino,
      idCampoPersonalizado: r.rows[0].id_campo_personalizado
    }
  }

  return null
}

/* ============================================================
   MOTOR PRINCIPAL DO FUNIL
   ============================================================ */

/**
 * Ponto de entrada chamado pelo server.js a cada mensagem recebida.
 */
async function processarMensagem({ idUtilizador, idFunil, idChat, texto, sendMessage }) {
  if (!idFunil) {
    logger.warn("processarMensagem: sem idFunil configurado na instância")
    return
  }

  /* ── Cria registro do funil para novos utilizadores ── */
  const existe = await hasFunilUtilizador(idUtilizador, idFunil)
  if (!existe) {
    await createFunilUtilizador(idUtilizador, idFunil)
    const mensagemInicial = await getMensagemFunil({ idFunil, cdMensagem: 1 })
    if (mensagemInicial) {
      await sendMessage(mensagemInicial.textoFinal)
    }
    return
  }

  /* ── Recupera estado atual ── */
  const cdMensagemAtual = await getEstadoConversa(idUtilizador, idFunil)

  // cd_mensagem = 0 significa chat finalizado; reinicia o fluxo
  if (cdMensagemAtual === 0 || cdMensagemAtual === null) {
    await atualizarEstadoConversa(idUtilizador, idFunil, 1)
    await updateChatStatus({ idUtilizador, status: "C" })
    const mensagemInicial = await getMensagemFunil({ idFunil, cdMensagem: 1 })
    if (mensagemInicial) {
      await sendMessage(mensagemInicial.textoFinal)
    }
    return
  }

  /* ── Resolve o tipo da mensagem atual ── */
  const mensagemAtual = await getMensagemFunil({ idFunil, cdMensagem: cdMensagemAtual })

  if (!mensagemAtual) {
    logger.warn(`getMensagemFunil: mensagem ${cdMensagemAtual} não encontrada para funil ${idFunil}`)
    return
  }

  logger.info(`[FUNIL] utilizador=${idUtilizador} cdMensagem=${cdMensagemAtual} tipo=${mensagemAtual.tipo}`)

  /* ── Despacha para o handler correto ── */
  if (mensagemAtual.tipo === "CHATBOT") {
    await _processarRespostaChatbot({
      idUtilizador, idFunil, texto, sendMessage,
      idFunilChatbot: mensagemAtual.idRegistro
    })
    return
  }

  if (mensagemAtual.tipo === "CADASTRO") {
    await _processarRespostaCadastro({
      idUtilizador, idFunil, texto, sendMessage,
      idFunilCadastro: mensagemAtual.idRegistro
    })
    return
  }

  if (mensagemAtual.tipo === "CADASTRO_RESPOSTA") {
    await _processarRespostaLivre({
      idUtilizador, idFunil, texto, sendMessage,
      cdMensagemDestino: mensagemAtual.cdMensagemDestino,
      idCampoPersonalizado: mensagemAtual.idCampoPersonalizado
    })
    return
  }
}

/* ============================================================
   HANDLERS INTERNOS
   ============================================================ */

/**
 * Resposta a uma mensagem CHATBOT (botões numéricos).
 */
async function _processarRespostaChatbot({ idUtilizador, idFunil, texto, sendMessage, idFunilChatbot }) {
  const cdBotao = Number(texto.trim())

  if (!Number.isInteger(cdBotao) || cdBotao <= 0) {
    await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
    return
  }

  const rBotao = await db.query(
    `SELECT cd_mensagem_destino FROM tbl_funil_chatbot_botao
     WHERE id_funil_chatbot = $1 AND cd_botao = $2 LIMIT 1`,
    [idFunilChatbot, cdBotao]
  )

  if (rBotao.rows.length === 0) {
    await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
    return
  }

  const cdDestino = rBotao.rows[0].cd_mensagem_destino

  await atualizarEstadoConversa(idUtilizador, idFunil, cdDestino)
  logger.info(`[CHATBOT] destino: ${cdDestino}`)

  const proxMensagem = await getMensagemFunil({ idFunil, cdMensagem: cdDestino })

  if (!proxMensagem) {
    logger.warn(`[CHATBOT] mensagem destino ${cdDestino} não encontrada`)
    return
  }

  await sendMessage(proxMensagem.textoFinal)

  if (!proxMensagem.possuiBotoes && proxMensagem.tipo !== "CADASTRO_RESPOSTA") {
    await finalizarChat({ idUtilizador, idFunil })
  }
}

/**
 * Resposta a uma mensagem CADASTRO (botões de escolha com campos personalizados).
 */
async function _processarRespostaCadastro({ idUtilizador, idFunil, texto, sendMessage, idFunilCadastro }) {
  const cdBotao = Number(texto.trim())

  if (!Number.isInteger(cdBotao) || cdBotao <= 0) {
    await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
    return
  }

  const rBotao = await db.query(
    `SELECT cd_mensagem_destino, id_campo_personalizado, ds_resultado
     FROM tbl_funil_cadastro_botao
     WHERE id_funil_cadastro = $1 AND cd_botao = $2 LIMIT 1`,
    [idFunilCadastro, cdBotao]
  )

  if (rBotao.rows.length === 0) {
    await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
    return
  }

  const { cd_mensagem_destino, id_campo_personalizado, ds_resultado } = rBotao.rows[0]

  // Persiste o campo personalizado escolhido (ex: "CPF" ou "CNPJ")
  if (id_campo_personalizado && ds_resultado) {
    await salvarCampoPersonalizado(idUtilizador, id_campo_personalizado, ds_resultado)
  }

  await atualizarEstadoConversa(idUtilizador, idFunil, cd_mensagem_destino)
  logger.info(`[CADASTRO] destino: ${cd_mensagem_destino}`)

  const proxMensagem = await getMensagemFunil({ idFunil, cdMensagem: cd_mensagem_destino })

  if (!proxMensagem) {
    logger.warn(`[CADASTRO] mensagem destino ${cd_mensagem_destino} não encontrada`)
    return
  }

  await sendMessage(proxMensagem.textoFinal)

  if (!proxMensagem.possuiBotoes && proxMensagem.tipo !== "CADASTRO_RESPOSTA") {
    await finalizarChat({ idUtilizador, idFunil })
  }
}

/**
 * Resposta a uma mensagem CADASTRO_RESPOSTA (texto livre, salva em campo personalizado).
 */
async function _processarRespostaLivre({ idUtilizador, idFunil, texto, sendMessage, cdMensagemDestino, idCampoPersonalizado }) {
  // Salva o texto livre no campo personalizado correspondente
  if (idCampoPersonalizado && texto.trim()) {
    await salvarCampoPersonalizado(idUtilizador, idCampoPersonalizado, texto.trim())
  }

  await atualizarEstadoConversa(idUtilizador, idFunil, cdMensagemDestino)
  logger.info(`[CADASTRO_RESPOSTA] destino: ${cdMensagemDestino}`)

  const proxMensagem = await getMensagemFunil({ idFunil, cdMensagem: cdMensagemDestino })

  if (!proxMensagem) {
    logger.warn(`[CADASTRO_RESPOSTA] mensagem destino ${cdMensagemDestino} não encontrada`)
    return
  }

  await sendMessage(proxMensagem.textoFinal)

  if (!proxMensagem.possuiBotoes && proxMensagem.tipo !== "CADASTRO_RESPOSTA") {
    await finalizarChat({ idUtilizador, idFunil })
  }
}

/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = {
  // Utilitários de identificação
  extrairNumeroWhatsapp,
  extrairIdentificadorTelegram,
  isStatusBroadcast,

  // Utilizador
  getOrCreateUtilizador,

  // Estado do funil
  hasFunilUtilizador,
  createFunilUtilizador,
  getEstadoConversa,
  finalizarChat,

  // Chat
  getChatStatus,
  updateChatStatus,

  // Mensagens
  getMensagemFunil,
  salvarCampoPersonalizado,

  // Motor principal
  processarMensagem,
}