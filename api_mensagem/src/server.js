// server.js
const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const axios = require("axios")
const logger = require("../logger")
const db = require("./config/db")
const TelegramMessageModel = require("./models/TelegramMessageModel")
const { v4: uuidv4 } = require("uuid")

dotenv.config()

const app = express()
app.use(bodyParser.json())

const DEFAULT_FUNIL_ID = "e1e4748f-aa5b-4981-8694-81dc5aabde9c"
const FUNIL_EXPIRACAO_MIN = 60 * 24 * 7 // 7 dias

/* =====================================================
   HELPERS
===================================================== */

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

async function getOrCreateUtilizador({ cdTelegram, cdWhatsapp, telefone }) {
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
    (id_utilizador, nu_telefone, cd_whatsapp, cd_telegram)
    VALUES ($1,$2,$3,$4)
    `,
    [
      idUtilizador,
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
  const cdBotao = parseInt(texto)
  if (isNaN(cdBotao)) return

  // 1️⃣ Cadastro inicial
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
    SELECT cd_mensagem_destino, id_funil_chatbot
    FROM tbl_funil_cadastro_botao
    WHERE id_funil_cadastro = $1
      AND cd_botao = $2
    LIMIT 1
    `,
    [id_funil_cadastro, cdBotao]
  )
  if (rBotao.rows.length === 0) return

  const { cd_mensagem_destino, id_funil_chatbot } = rBotao.rows[0]

  // 3️⃣ Atualiza estado do usuário (ENTRA NO CHATBOT)
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

  // 4️⃣ Busca mensagem + botões do chatbot
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
  const cdBotao = parseInt(texto)
  if (isNaN(cdBotao)) return

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

  const rBotao = await db.query(
    `
    SELECT cd_mensagem_destino
    FROM tbl_funil_chatbot_botao b
    JOIN tbl_funil_chatbot c
      ON c.id_funil_chatbot = b.id_funil_chatbot
    WHERE c.id_funil = $1
      AND c.cd_mensagem = $2
      AND b.cd_botao = $3
    LIMIT 1
    `,
    [DEFAULT_FUNIL_ID, cdMensagemAtual, cdBotao]
  )

  if (rBotao.rows.length === 0) return

  const cdDestino = rBotao.rows[0].cd_mensagem_destino

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

  const mensagem = await getMensagemChatbotComBotoes({
    idFunil: DEFAULT_FUNIL_ID,
    cdMensagem: cdDestino
  })

  if (mensagem) {
    await sendMessage(mensagem.textoFinal)
  }
}

async function sendWhatsAppMessage({ telefone, message }) {
  await axios.post(
    `http://chatbot-erp:3000/instances/caetano_bot/message`,
    { number: telefone, message },
    { timeout: 8000 }
  )
}

async function sendTelegramMessage({ userId, message }) {
  await axios.post(
    "http://telegram-bot:3002/send-message",
    { nome: "Bot", userId, message },
    { timeout: 8000 }
  )
}

/* =====================================================
   WEBHOOK
===================================================== */

app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body

    /* ================= TELEGRAM ================= */

    if (msg.className === "Message" && msg.peerId?.className === "PeerUser") {
      if (msg.out === true) return res.status(200).json({ success: true })

      await TelegramMessageModel.saveTelegramMessage(msg)

      const telegramUserId = msg.fromId?.userId?.toString()
      if (!telegramUserId) return res.status(400).json({ success: false })

      const idUtilizador = await getOrCreateUtilizador({
        cdTelegram: telegramUserId
      })

      const jaPassou = await hasFunilUtilizador(
        idUtilizador,
        DEFAULT_FUNIL_ID
      )

      if (jaPassou) {
        const estadoChatbot = await getEstadoConversa(
          idUtilizador,
          DEFAULT_FUNIL_ID
        )

        // 👉 SE JÁ ENTROU NO CHATBOT, SEMPRE CONTINUA NELE
        if (estadoChatbot && estadoChatbot > 0) {
          await processarRespostaChatbot({
            idUtilizador,
            texto: msg.message,
            sendMessage: async (message) =>
              sendTelegramMessage({
                userId: telegramUserId,
                message
              })
          })
        } 
        // 👉 PRIMEIRA RESPOSTA APÓS BOAS-VINDAS
        else {
          await processarRespostaCadastro({
            idUtilizador,
            texto: msg.message,
            sendMessage: async (message) =>
              sendTelegramMessage({
                userId: telegramUserId,
                message
              })
          })
        }

        return res.status(200).json({ success: true })
      }

      await createFunilUtilizador(idUtilizador, DEFAULT_FUNIL_ID)

      const mensagem = await getMensagemInicialComBotoes(DEFAULT_FUNIL_ID)

      if (mensagem) {
        await sendTelegramMessage({
          userId: telegramUserId,
          message: mensagem
        })
      }

      return res.status(200).json({ success: true })
    }

    /* ================= WHATSAPP ================= */

    if (msg.event === "message.received" && msg.whatsapp && msg.message) {
      const body = msg.message.text || ""
      if (!body || msg.message?.raw?.protocolMessage) {
        return res.status(200).json({ success: true })
      }

      const telefone = msg.whatsapp.jid.split("@")[0]

      const idUtilizador = await getOrCreateUtilizador({
        cdWhatsapp: telefone,
        telefone
      })

      const jaPassou = await hasFunilUtilizador(
        idUtilizador,
        DEFAULT_FUNIL_ID
      )

      if (jaPassou) {
        const estadoChatbot = await getEstadoConversa(
          idUtilizador,
          DEFAULT_FUNIL_ID
        )

        // 👉 SE JÁ ENTROU NO CHATBOT, SEMPRE CONTINUA NELE
        if (estadoChatbot && estadoChatbot > 0) {
          await processarRespostaChatbot({
            idUtilizador,
            texto: msg.message,
            sendMessage: async (message) =>
              sendWhatsAppMessage({
                userId: telegramUserId,
                message
              })
          })
        } 
        // 👉 PRIMEIRA RESPOSTA APÓS BOAS-VINDAS
        else {
          await processarRespostaCadastro({
            idUtilizador,
            texto: msg.message,
            sendMessage: async (message) =>
              sendWhatsAppMessage({
                userId: telegramUserId,
                message
              })
          })
        }

        return res.status(200).json({ success: true })
      }

      await createFunilUtilizador(idUtilizador, DEFAULT_FUNIL_ID)

      const mensagem = await getMensagemInicialComBotoes(DEFAULT_FUNIL_ID)

      if (mensagem) {
        await sendWhatsAppMessage({
          telefone,
          message: mensagem
        })
      }

      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ success: false })
  } catch (err) {
    logger.error(`❌ Webhook error: ${err.message}`)
    return res.status(500).json({ success: false })
  }
})

app.get("/", (_, res) =>
  res.send("🚀 API de Mensagens ativa e rodando!")
)

const PORT = process.env.PORT || 3001
app.listen(PORT, "0.0.0.0", () =>
  logger.info(`🚀 Servidor rodando na porta ${PORT}`)
)