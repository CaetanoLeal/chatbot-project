// server.js
const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const axios = require("axios")
const logger = require("../logger")
const db = require("./config/db") // conexão com PostgreSQL
const MessageModel = require("./models/MessageModel")
const TelegramMessageModel = require("./models/TelegramMessageModel")
const { v4: uuidv4 } = require("uuid")

dotenv.config()

const app = express()
app.use(bodyParser.json())

// Funil padrão (substitua se for variável/config)
const DEFAULT_FUNIL_ID = "e1e4748f-aa5b-4981-8694-81dc5aabde9c"

// Helper: envia mensagem pro microserviço do telegram
async function sendToTelegramService({ nome, userId, message, buttons }) {
  try {
    const payload = { nome, userId, message }

    if (buttons) payload.buttons = buttons

    await axios.post(
      "http://telegram-bot:3002/send-message",
      payload,
      { timeout: 8000 }
    )

    logger.info("📤 Mensagem enviada ao serviço telegram-bot")
  } catch (err) {
    logger.error(`❌ Erro ao enviar para telegram-bot: ${err.message}`)
  }
}

app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body

    logger.info(
      `📦 Conteúdo recebido no webhook:\n${JSON.stringify(msg, null, 2)}`
    )

    // ---- TELEGRAM ----
    if (msg.className === "Message" && msg.peerId) {

      // Ignorar mensagens de grupo/canal
      if (msg.peerId.className !== "PeerUser") {
        logger.info(
          `Mensagem ignorada de grupo/canal: peerId.className = ${msg.peerId.className}`
        )
        return res.status(200).json({
          success: true,
          source: "telegram",
          message: "Mensagem de grupo/canal ignorada."
        })
      }

      // Ignorar ações de digitação/ações
      if (
        msg.className === "MessageAction" ||
        msg.action?.className === "MessageActionTyping"
      ) {
        logger.info("Mensagem de ação ignorada")
        return res.status(200).json({
          success: true,
          source: "telegram",
          message: "Mensagem de ação ignorada."
        })
      }

      // Gravar mensagem raw no DB
      try {
        await TelegramMessageModel.saveTelegramMessage(msg)
      } catch (err) {
        logger.warn(
          `Falha ao salvar TelegramMessage (não crítico): ${err.message}`
        )
      }

      const text = msg.message || ""
      const isOutgoing = msg.out === true

      // Mensagens enviadas pelo próprio bot -> ignorar
      if (isOutgoing) {
        logger.info("Mensagem enviada pelo bot, ignorando")
        return res.status(200).json({
          success: true,
          source: "telegram",
          message: "Mensagem enviada."
        })
      }

      // Mensagem recebida de usuário
      const telegramUserId = msg.fromId?.userId?.toString()

      if (!telegramUserId) {
        logger.warn("Mensagem sem fromId.userId. Ignorando.")
        return res.status(400).json({
          success: false,
          message: "fromId.userId ausente"
        })
      }

      // ===== Etapa 1: obter ou criar utilizador =====
      let vIdUtilizador

      try {
        const rUser = await db.query(
          "SELECT id_utilizador FROM tbl_utilizador WHERE cd_telegram = $1",
          [telegramUserId]
        )

        if (rUser.rows.length > 0) {
          vIdUtilizador = rUser.rows[0].id_utilizador
          logger.info(`✅ Utilizador já existente (${vIdUtilizador})`)
        } else {
          vIdUtilizador = uuidv4()

          await db.query(
            "INSERT INTO tbl_utilizador (id_utilizador, cd_telegram) VALUES ($1, $2)",
            [vIdUtilizador, telegramUserId]
          )

          logger.info(`🆕 Novo utilizador cadastrado (${vIdUtilizador})`)
        }
      } catch (err) {
        logger.error(`❌ Erro ao obter/criar utilizador: ${err.message}`)
        return res.status(500).json({
          success: false,
          message: "Erro ao processar utilizador"
        })
      }

      // ===== Etapa 2: obter ou criar registro em tbl_funil_utilizador =====
      const vIdFunil = DEFAULT_FUNIL_ID
      let funilUtilizador = null
      let cdMensagemCadastro = 0
      let cdMensagemChatbot = 0
      let idFunilUtilizador = null

      try {
        const vIsFunilUtilizador = await db.query(
          `
          SELECT *
          FROM tbl_funil_utilizador
          WHERE id_utilizador = $1 AND id_funil = $2
          ORDER BY dh_mensagem DESC
          LIMIT 1
          `,
          [vIdUtilizador, vIdFunil]
        )

        if (vIsFunilUtilizador.rows.length > 0) {
          funilUtilizador = vIsFunilUtilizador.rows[0]
          idFunilUtilizador = funilUtilizador.id_funil_utilizador
          cdMensagemCadastro = funilUtilizador.cd_mensagem_cadastro ?? 0
          cdMensagemChatbot = funilUtilizador.cd_mensagem_chatbot ?? 0

          logger.info(
            `✅ Funil utilizador existente: ${idFunilUtilizador} (cd_mensagem_cadastro=${cdMensagemCadastro})`
          )
        } else {
          idFunilUtilizador = uuidv4()
          const dhMensagem = new Date()
          const dhExpiracao = new Date(
            dhMensagem.getTime() + (global.gExpirarMinutos ?? 60) * 60000
          )

          await db.query(
            `
            INSERT INTO tbl_funil_utilizador
            (id_funil_utilizador, id_funil, id_utilizador, cd_mensagem_cadastro, cd_mensagem_chatbot, dh_mensagem, dh_expiracao)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            `,
            [
              idFunilUtilizador,
              vIdFunil,
              vIdUtilizador,
              cdMensagemCadastro,
              cdMensagemChatbot,
              dhMensagem,
              dhExpiracao
            ]
          )

          logger.info(
            `🆕 Inserido tbl_funil_utilizador (${idFunilUtilizador})`
          )
        }
      } catch (err) {
        logger.error(
          `❌ Erro ao obter/criar tbl_funil_utilizador: ${err.message}`
        )
        return res.status(500).json({
          success: false,
          message: "Erro ao processar funil do utilizador"
        })
      }

      // ===== Etapa 3: recuperar conteúdo da mensagem do funil =====
      try {
        const msgQuery = await db.query(
          `
          SELECT id_funil_cadastro, ds_mensagem, cd_mensagem_destino
          FROM tbl_funil_cadastro
          WHERE id_funil = $1 AND cd_mensagem = $2
          LIMIT 1
          `,
          [vIdFunil, cdMensagemCadastro]
        )

        if (msgQuery.rows.length === 0) {
          logger.warn(
            `Mensagem de funil não encontrada para cd_mensagem=${cdMensagemCadastro}`
          )
          return res.status(200).json({
            success: false,
            message: "Etapa de funil não configurada"
          })
        }

        const funilCadastroRow = msgQuery.rows[0]
        const textoMensagem =
          funilCadastroRow.ds_mensagem || "Escolha uma opção:"

        const vBotaoQuery = await db.query(
          `
          SELECT cd_botao, ds_botao
          FROM tbl_funil_cadastro_botao
          WHERE id_funil_cadastro = $1
          ORDER BY cd_botao
          `,
          [funilCadastroRow.id_funil_cadastro]
        )

        const userId = telegramUserId

        if (vBotaoQuery.rows.length > 0) {
          const buttons = vBotaoQuery.rows.map(b => ({
            text: b.ds_botao,
            callback_data: String(b.cd_botao)
          }))

          await sendToTelegramService({
            nome: "teste",
            userId,
            message: textoMensagem,
            buttons
          })

          await db.query(
            "UPDATE tbl_funil_utilizador SET dh_mensagem = $1 WHERE id_funil_utilizador = $2",
            [new Date(), idFunilUtilizador]
          )
        } else {
          await sendToTelegramService({
            nome: "teste",
            userId,
            message: textoMensagem
          })

          const proximoCd = Number(cdMensagemCadastro) + 1

          await db.query(
            `
            UPDATE tbl_funil_utilizador
            SET cd_mensagem_cadastro = $1, dh_mensagem = $2
            WHERE id_funil_utilizador = $3
            `,
            [proximoCd, new Date(), idFunilUtilizador]
          )
        }

        return res.status(200).json({
          success: true,
          source: "telegram",
          message: "Mensagem processada."
        })
      } catch (err) {
        logger.error(`❌ Erro no processamento do funil: ${err.message}`)
        return res.status(500).json({
          success: false,
          message: "Erro ao processar etapa do funil"
        })
      }
    }

    // ---- WHATSAPP (BAILEYS) ----    
    async function sendWhatsAppMessage({ instanceName, telefone, message }) {
      try {
        await axios.post(
          `http://chatbot-erp:3000/instances/caetano_bot/message`,
          {
            number: telefone,
            message
          },
          { timeout: 8000 }
        )

        logger.info(`📤 WhatsApp enviado para ${telefone}`)
      } catch (err) {
        logger.error(`❌ Erro ao enviar WhatsApp: ${err.message}`)
      }
    }

    if (msg.event === "message.received" && msg.whatsapp && msg.message) {
      const vFrom = msg.whatsapp.jid
      const instanceId = msg.instance?.id
      const body = msg.message.text || ""

      if (
        msg.message?.raw?.protocolMessage ||
        !body ||
        body === "[Tipo não tratado]"
      ) {
        return res.status(200).json({ success: true, ignored: true })
      }

      const telefone = vFrom.split("@")[0]
      logger.info(`📩 WhatsApp: ${telefone} → ${body}`)

      const mensagensFunil = await db.query(
        `
        SELECT ds_mensagem
        FROM tbl_funil_cadastro
        WHERE id_funil = $1
        ORDER BY cd_mensagem
        `,
        [DEFAULT_FUNIL_ID]
      )

      for (const row of mensagensFunil.rows) {
        if (!row.ds_mensagem) continue

        await sendWhatsAppMessage({
          instanceName: msg.instance.name,
          telefone,
          message: row.ds_mensagem
        })

        // pequeno delay opcional para evitar bloqueio
        await new Promise(r => setTimeout(r, 800))
      }


      return res.status(200).json({ success: true, source: "whatsapp" })
    }

    logger.warn(`⚠️ Formato desconhecido: ${JSON.stringify(msg)}`)
    return res.status(400).json({
      success: false,
      message: "Formato de mensagem não reconhecido"
    })
  } catch (err) {
    logger.error(`❌ Erro no processamento do webhook: ${err.message}`)
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor"
    })
  }
})

app.get("/", (req, res) =>
  res.send("🚀 API de Mensagens ativa e rodando!")
)

const PORT = process.env.PORT || 3001

app.listen(PORT, "0.0.0.0", () =>
  logger.info(`🚀 Servidor rodando na porta ${PORT}`)
)
