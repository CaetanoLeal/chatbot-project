// helpers/helpers.js
const db = require("../config/db")
const logger = require("../../logger")
const { v4: uuidv4 } = require("uuid")
const {
  DEFAULT_FUNIL_ID,
  FUNIL_EXPIRACAO_MIN
} = require("../constants/chatbot.constants.js")

function extrairNumeroWhatsapp({ jid, jidAlt, raw }) {
  const candidatos = [
    jidAlt,
    jid,
    raw?.key?.participant,
    raw?.key?.remoteJid
  ]

  for (const item of candidatos) {
    if (!item) continue

    // PRIORIDADE: jid válido
    if (item.includes("@s.whatsapp.net")) {
      return item.split("@")[0].split(":")[0]
    }
  }

  // fallback (último caso)
  for (const item of candidatos) {
    if (!item) continue

    if (item.includes("@")) {
      return item.split("@")[0].split(":")[0]
    }
  }

  return null
}

async function getEstadoConversa(idUtilizador, idFunil) {
  const r = await db.query(
    `
    SELECT cd_mensagem_chatbot
    FROM tbl_funil_utilizador
    WHERE id_utilizador = $1
      AND id_funil = $2
    LIMIT 1
    `,
    [idUtilizador, idFunil]
  )

  if (r.rows.length === 0) return null

  return r.rows[0].cd_mensagem_chatbot
}

async function getOrCreateUtilizador({ cdTelegram, cdWhatsapp, telefone, nome }) {
  const campo = cdTelegram ? "cd_telegram" : "cd_whatsapp"
  const valor = cdTelegram || cdWhatsapp

  const rUser = await db.query(
    `SELECT id_utilizador FROM tbl_utilizador WHERE ${campo} = $1`,
    [valor]
  )

  if (rUser.rows.length > 0) {
    return rUser.rows[0].id_utilizador
  }

  const idUtilizador = uuidv4()

  await db.query(
    `
    INSERT INTO tbl_utilizador
    (id_utilizador, no_utilizador, nu_telefone, cd_whatsapp, cd_telegram)
    VALUES ($1,$2,$3,$4,$5)
    `,
    [
      idUtilizador,
      nome ?? null,
      telefone ?? null,
      cdWhatsapp ?? null,
      cdTelegram ?? null
    ]
  )

  logger.info(`🆕 Utilizador criado (${idUtilizador})`)
  return idUtilizador
}

async function hasFunilUtilizador(idUtilizador, idFunil) {
  const r = await db.query(
    `
    SELECT 1
    FROM tbl_funil_utilizador
    WHERE id_utilizador = $1 AND id_funil = $2
    LIMIT 1
    `,
    [idUtilizador, idFunil]
  )
  return r.rows.length > 0
}

async function createFunilUtilizador(idUtilizador, idFunil) {
  const now = new Date()
  const exp = new Date(now.getTime() + FUNIL_EXPIRACAO_MIN * 60000)

  await db.query(
    `
    INSERT INTO tbl_funil_utilizador
    (id_funil_utilizador, id_funil, id_utilizador,
     cd_mensagem_cadastro, cd_mensagem_chatbot,
     dh_mensagem, dh_expiracao)
    VALUES ($1,$2,$3,1,0,$4,$5)
    `,
    [uuidv4(), idFunil, idUtilizador, now, exp]
  )
}

async function getMensagemInicialComBotoes(idFunil) {
  // 1️⃣ Mensagem principal
  const rMensagem = await db.query(
    `
    SELECT id_funil_cadastro, ds_mensagem
    FROM tbl_funil_cadastro
    WHERE id_funil = $1
      AND cd_mensagem = 1
    LIMIT 1
    `,
    [idFunil]
  )

  if (rMensagem.rows.length === 0) return null

  const { id_funil_cadastro, ds_mensagem } = rMensagem.rows[0]

  // 2️⃣ Botões
  const rBotoes = await db.query(
    `
    SELECT cd_botao, ds_botao
    FROM tbl_funil_cadastro_botao
    WHERE id_funil_cadastro = $1
    ORDER BY cd_botao
    `,
    [id_funil_cadastro]
  )

  // 3️⃣ Montagem do texto
  let textoFinal = ds_mensagem

  if (rBotoes.rows.length > 0) {
    textoFinal += "\n\n"
    textoFinal += rBotoes.rows
      .map(b => `${b.cd_botao} - ${b.ds_botao}`)
      .join("\n")
  }

  return textoFinal
}

async function processarRespostaCadastro({
  idUtilizador,
  texto,
  sendMessage
}) {
  const cdBotao = Number(texto)

  if (!Number.isInteger(cdBotao)) {
    await sendMessage(
      "resposta invalida! escolha uma das opções acima digitando o numero correspondente a ela"
    )
    return
  }

  // 1️⃣ Mensagem inicial
  const rCadastro = await db.query(
    `
    SELECT id_funil_cadastro
    FROM tbl_funil_cadastro
    WHERE id_funil = $1
      AND cd_mensagem = 1
    LIMIT 1
    `,
    [DEFAULT_FUNIL_ID]
  )

  if (rCadastro.rows.length === 0) return

  const { id_funil_cadastro } = rCadastro.rows[0]

  // 2️⃣ Botão escolhido
  const rBotao = await db.query(
    `
    SELECT cd_mensagem_destino
    FROM tbl_funil_cadastro_botao
    WHERE id_funil_cadastro = $1
      AND cd_botao = $2
    LIMIT 1
    `,
    [id_funil_cadastro, cdBotao]
  )

  if (rBotao.rows.length === 0) {
    await sendMessage(
      "resposta invalida! escolha uma das opções acima digitando o numero correspondente a ela"
    )
    return
  }

  const { cd_mensagem_destino } = rBotao.rows[0]

  // 3️⃣ Atualiza estado
  await db.query(
    `
    UPDATE tbl_funil_utilizador
    SET cd_mensagem_chatbot = $1,
        dh_mensagem = NOW()
    WHERE id_utilizador = $2
      AND id_funil = $3
    `,
    [cd_mensagem_destino, idUtilizador, DEFAULT_FUNIL_ID]
  )

  // 4️⃣ Envia próxima mensagem
  const mensagem = await getMensagemChatbotComBotoes({
    idFunil: DEFAULT_FUNIL_ID,
    cdMensagem: cd_mensagem_destino
  })

  if (mensagem) {
    await sendMessage(mensagem.textoFinal)
  }
}

async function getMensagemChatbotComBotoes({ idFunil, cdMensagem }) {
  const rMsg = await db.query(
    `
    SELECT id_funil_chatbot, ds_mensagem
    FROM tbl_funil_chatbot
    WHERE id_funil = $1
      AND cd_mensagem = $2
    LIMIT 1
    `,
    [idFunil, cdMensagem]
  )

  if (rMsg.rows.length === 0) return null

  const { id_funil_chatbot, ds_mensagem } = rMsg.rows[0]

  const rBotoes = await db.query(
    `
    SELECT cd_botao, ds_botao
    FROM tbl_funil_chatbot_botao
    WHERE id_funil_chatbot = $1
    ORDER BY cd_botao
    `,
    [id_funil_chatbot]
  )

  let textoFinal = ds_mensagem

  if (rBotoes.rows.length > 0) {
    textoFinal += "\n\n"
    textoFinal += rBotoes.rows
      .map(b => `${b.cd_botao} - ${b.ds_botao}`)
      .join("\n")
  }

  return { textoFinal, id_funil_chatbot }
}

async function processarRespostaChatbot({
  idUtilizador,
  texto,
  sendMessage
}) {
  const cdBotao = Number(texto)

  if (!Number.isInteger(cdBotao)) {
    await sendMessage(
      "resposta invalida! escolha uma das opções acima digitando o numero correspondente a ela"
    )
    return
  }

  // 1️⃣ Estado atual
  const rEstado = await db.query(
    `
    SELECT cd_mensagem_chatbot
    FROM tbl_funil_utilizador
    WHERE id_utilizador = $1
      AND id_funil = $2
    LIMIT 1
    `,
    [idUtilizador, DEFAULT_FUNIL_ID]
  )

  if (rEstado.rows.length === 0) return

  const cdMensagemAtual = rEstado.rows[0].cd_mensagem_chatbot

  // 2️⃣ ID da mensagem atual
  const rMensagemAtual = await db.query(
    `
    SELECT id_funil_chatbot
    FROM tbl_funil_chatbot
    WHERE id_funil = $1
      AND cd_mensagem = $2
    LIMIT 1
    `,
    [DEFAULT_FUNIL_ID, cdMensagemAtual]
  )

  if (rMensagemAtual.rows.length === 0) return

  const idFunilChatbotAtual = rMensagemAtual.rows[0].id_funil_chatbot

  // 3️⃣ Botão selecionado
  const rBotao = await db.query(
    `
    SELECT cd_mensagem_destino
    FROM tbl_funil_chatbot_botao
    WHERE id_funil_chatbot = $1
      AND cd_botao = $2
    LIMIT 1
    `,
    [idFunilChatbotAtual, cdBotao]
  )

  if (rBotao.rows.length === 0) {
    await sendMessage(
      "resposta invalida! escolha uma das opções acima digitando o numero correspondente a ela"
    )
    return
  }

  const cdDestino = rBotao.rows[0].cd_mensagem_destino

  // 4️⃣ Atualiza estado
  await db.query(
    `
    UPDATE tbl_funil_utilizador
    SET cd_mensagem_chatbot = $1,
        dh_mensagem = NOW()
    WHERE id_utilizador = $2
      AND id_funil = $3
    `,
    [cdDestino, idUtilizador, DEFAULT_FUNIL_ID]
  )

  // 5️⃣ Próxima mensagem
  const mensagem = await getMensagemChatbotComBotoes({
    idFunil: DEFAULT_FUNIL_ID,
    cdMensagem: cdDestino
  })

  if (mensagem) {
    await sendMessage(mensagem.textoFinal)
  }
}

module.exports = {
  extrairNumeroWhatsapp,
  getEstadoConversa,
  getOrCreateUtilizador,
  hasFunilUtilizador,
  createFunilUtilizador,
  getMensagemInicialComBotoes,
  processarRespostaCadastro,
  getMensagemChatbotComBotoes,
  processarRespostaChatbot
}
