//src/server.js
const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const cors = require('cors')

const logger = require("../logger")
const helper = require("./helpers/helpers")
const routes = require('./routes')

const sendMessage = require("./services/sendMessage")
const constants = require("./constants/chatbot.constants")
const idFunil = constants.DEFAULT_FUNIL_ID

const TelegramMessageModel = require("./models/TelegramMessageModel")
const MessageModels = require("./models/MessageModel")
const InstanceModel = require("./models/InstanceModel")

dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())


let gTipo = constants.TIPO.NENHUM

app.use('/api', routes)

/*
=====================================================
   WEBHOOK
=====================================================
*/
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body

    gTipo =
      msg.className === "Message"
        ? constants.TIPO.TELEGRAM
        : msg.event === "message.received"
        ? constants.TIPO.WHATSAPP
        : constants.TIPO.NENHUM

    /* ================= INSTÂNCIA ================= */
    if (msg.event === "instance.created") {

      const provider =
        msg.provider === "whatsapp"
          ? InstanceModel.PROVIDER.WHATSAPP
          : InstanceModel.PROVIDER.TELEGRAM

      await InstanceModel.saveOrUpdateInstance({
        no_instancia: msg.nome,
        cd_provider: provider,
        cd_status: InstanceModel.STATUS.INATIVO,
        ds_webhook: msg.webhook || null,
        ds_auth_path: msg.ds_auth_path || null,
        id_funil: msg.id_funil || null
      })

      return res.status(200).json({ success: true })
    }

    if (msg.event === "instance.connected") {

      const provider =
        msg.provider === "whatsapp"
          ? InstanceModel.PROVIDER.WHATSAPP
          : InstanceModel.PROVIDER.TELEGRAM

      await InstanceModel.saveOrUpdateInstance({
        no_instancia: msg.nome,
        cd_provider: provider,
        cd_status: InstanceModel.STATUS.ATIVO,
        session_string: msg.session_string || null,
        nu_telefone: msg.phoneNumber || null,
        ds_webhook: msg.webhook || null,
        ds_foto_perfil: null,
        ds_auth_path: msg.ds_auth_path || null,
        id_funil: msg.id_funil || null
      })

      io.emit("INSTANCE_CONNECTED", {
        nome: msg.nome,
        telefone: msg.phoneNumber
      })

      return res.status(200).json({ success: true })
    }

    if (msg.event === "instance.disconnected") {

      const provider =
        msg.provider === "whatsapp"
          ? InstanceModel.PROVIDER.WHATSAPP
          : InstanceModel.PROVIDER.TELEGRAM

      await InstanceModel.saveOrUpdateInstance({
        no_instancia: msg.nome,
        cd_provider: provider,
        cd_status: InstanceModel.STATUS.DESCONECTADO
      })

      io.emit("INSTANCE_DISCONNECTED", {
        nome: msg.nome
      })

      return res.status(200).json({ success: true })
    }

    /* ================= TELEGRAM ================= */
    if (msg.className === "Message" && msg.peerId?.className === "PeerUser") {
      if (msg.out === true) {
        return res.status(200).json({ success: true })
      }

      await TelegramMessageModel.saveTelegramMessage(msg)

      const telegramUserId = msg.fromId?.userId?.toString()
      if (!telegramUserId) {
        return res.status(400).json({ success: false })
      }

      const idUtilizador = await helper.getOrCreateUtilizador({
        cdTelegram: telegramUserId
      })

      const jaPassou = await helper.hasFunilUtilizador(
        idUtilizador,
        idFunil
      )

      if (jaPassou) {
        const estadoChatbot = await helper.getEstadoConversa(
          idUtilizador,
          idFunil
        )

        if (estadoChatbot && estadoChatbot > 0) {
          await helper.processarRespostaChatbot({
            idUtilizador,
            texto: msg.message,
            sendMessage: (message) =>
              sendMessage.sendTelegramMessage({
                userId: telegramUserId,
                message
              })
          })
        } else {
          await helper.processarRespostaCadastro({
            idUtilizador,
            texto: msg.message,
            sendMessage: (message) =>
              sendMessage.sendTelegramMessage({
                userId: telegramUserId,
                message
              })
          })
        }

        return res.status(200).json({ success: true })
      }

      await helper.createFunilUtilizador(
        idUtilizador,
        idFunil
      )

      const mensagem = await helper.getMensagemInicialComBotoes(
        idFunil
      )

      if (mensagem) {
        await sendMessage.sendTelegramMessage({
          userId: telegramUserId,
          message: mensagem
        })
      }

      return res.status(200).json({ success: true })
    }

    /* ================= WHATSAPP ================= */
    if (msg.event === "instance.qr") {

      io.emit("INSTANCE_QR", {
        nome: msg.nome,
        qrCode: msg.qrCode
      })

      return res.status(200).json({ success: true })
    }

    if (msg.event === "message.received" && msg.whatsapp && msg.message) {
      const body = msg.message.text || ""

      if (!body || msg.message?.raw?.protocolMessage) {
        return res.status(200).json({ success: true })
      }

      await MessageModels.saveMessageFromBaileys(msg)

      const telefone = helper.extrairNumeroWhatsapp({
        jid: msg.whatsapp.jid,
        jidAlt: msg.whatsapp.jidAlt
      })

      if (!telefone) {
        logger.warn("⚠️ Não foi possível extrair número do WhatsApp", {
          jid: msg.whatsapp.jid,
          jidAlt: msg.whatsapp.jidAlt
        })
        return res.status(200).json({ success: true })
      }

      const idUtilizador = await helper.getOrCreateUtilizador({
        cdWhatsapp: telefone,
        telefone
      })

      const jaPassou = await helper.hasFunilUtilizador(
        idUtilizador,
        idFunil
      )

      if (jaPassou) {
        const estadoChatbot = await helper.getEstadoConversa(
          idUtilizador,
          idFunil
        )

        if (estadoChatbot && estadoChatbot > 0) {
          await helper.processarRespostaChatbot({
            idUtilizador,
            texto: body,
            sendMessage: (message) =>
              sendMessage.sendWhatsAppMessage({
                telefone,
                message
              })
          })
        } else {
          await helper.processarRespostaCadastro({
            idUtilizador,
            texto: body,
            sendMessage: (message) =>
              sendMessage.sendWhatsAppMessage({
                telefone,
                message
              })
          })
        }

        return res.status(200).json({ success: true })
      }

      await helper.createFunilUtilizador(
        idUtilizador,
        idFunil
      )

      const mensagem = await helper.getMensagemInicialComBotoes(
        idFunil
      )

      if (mensagem) {
        await sendMessage.sendWhatsAppMessage({
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

app.use((err, req, res, next) => {
  logger.error("🔥 Erro não tratado:", err)

  return res.status(500).json({
    success: false,
    message: "Erro interno do servidor"
  })
})

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Rota não encontrada"
  })
})

const http = require("http")
const { Server } = require("socket.io")

const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: "*" }
})

const PORT = process.env.PORT || 3001

server.listen(PORT, "0.0.0.0", () =>
  logger.info(`🚀 Servidor rodando na porta ${PORT}`)
)
