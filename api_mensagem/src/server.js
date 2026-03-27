//src/server.js
const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const cors = require('cors')

const logger = require("../logger")
const helper = require("./helpers/helpers")
const routes = require('./routes')

const sendMessage = require("./services/sendMessage")
const chatService = require("./services/chatService")
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

      /* ===== BUSCA INSTÂNCIA ===== */
      const instancia = await InstanceModel.getByName(msg.instance?.name)
      if (!instancia) {
        return res.status(200).json({ success: true })
      }

      const idChat = await chatService.getOrCreateChat({
        idUtilizador,
        cdProvider: 2,
        idInstancia: instancia.id_instancia
      })

      await chatService.saveUnifiedMessage({
        idChat,
        cdProvider: 2,
        idMensagemExterna: msg.id?.toString(),
        fromMe: false,
        conteudo: msg.message,
        tipo: "text",
        payload: msg,
        dhEnvio: new Date(msg.date * 1000)
      })

      io.emit("NEW_MESSAGE", {
        idChat,
        conteudo: msg.message,
        fromMe: false,
        telefone
      })

      /* ===== FLUXO FUNIL NORMAL ===== */

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
    if (msg.event === "message.received" && msg.whatsapp && msg.message) {

      const jid = msg.whatsapp?.jid

      /* IGNORA GRUPOS */
      if (jid?.endsWith("@g.us")) {
        return res.status(200).json({ success: true })
      }

        /* IGNORA MENSAGENS DO PRÓPRIO BOT */
      if (msg.message?.raw?.key?.fromMe) {
        return res.status(200).json({ success: true })
      }

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
        logger.warn("⚠️ Não foi possível extrair número do WhatsApp")
        return res.status(200).json({ success: true })
      }

      const nome =
        msg.whatsapp?.pushName ||
        telefone

      const idUtilizador = await helper.getOrCreateUtilizador({
        cdWhatsapp: telefone,
        telefone,
        nome
      })

      /* ===== BUSCA INSTÂNCIA ===== */
      const instancia = await InstanceModel.getByName(msg.nome)
      if (!instancia) {
        return res.status(200).json({ success: true })
      }

      const idChat = await chatService.getOrCreateChat({
        idUtilizador,
        cdProvider: 1,
        idInstancia: instancia.id_instancia
      })

      /* ==========================
        FOTO E LAST SEEN
      ========================== */

      const fotoPerfil = msg.whatsapp?.profilePicture || null

      const lastSeen = msg.whatsapp?.lastSeen
        ? new Date(msg.whatsapp.lastSeen * 1000)
        : null

      await chatService.updateChatContactInfo({
        idChat,
        fotoPerfil,
        lastSeen
      })

      /* ==========================
        DATA DA MENSAGEM
      ========================== */

      const ts = Number(msg.whatsapp?.timestamp)

      const dhEnvio = !isNaN(ts)
        ? new Date(ts * 1000)
        : new Date()

      /* ==========================
        SALVA MENSAGEM
      ========================== */

      await chatService.saveUnifiedMessage({
        idChat,
        cdProvider: 1,
        idMensagemExterna: msg.whatsapp?.messageId,
        fromMe: false,
        conteudo: body,
        tipo: "text",
        payload: msg.message,
        dhEnvio
      })

      /* ==========================
        SOCKET REALTIME
      ========================== */

      io.emit("NEW_MESSAGE", {
        idChat,
        conteudo: body,
        fromMe: false,
        telefone
      })

      /* ==========================
        FLUXO FUNIL NORMAL
      ========================== */

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

    /* ================= WHATSAPP ENVIADA ================= */
    if (msg.event === "message.sent" && msg.whatsapp && msg.message) {

      const body = msg.message.text || ""

      const telefone = helper.extrairNumeroWhatsapp({
        jid: msg.whatsapp.jid,
        jidAlt: msg.whatsapp.jidAlt
      })

      if (!telefone) {
        return res.status(200).json({ success: true })
      }

      const idUtilizador = await helper.getOrCreateUtilizador({
        cdWhatsapp: telefone,
        telefone
      })

      const instancia = await InstanceModel.getByName(msg.nome)
      if (!instancia) {
        return res.status(200).json({ success: true })
      }

      const idChat = await chatService.getOrCreateChat({
        idUtilizador,
        cdProvider: 1,
        idInstancia: instancia.id_instancia
      })

      await chatService.saveUnifiedMessage({
        idChat,
        cdProvider: 1,
        idMensagemExterna: msg.whatsapp?.messageId,
        fromMe: true,
        conteudo: body,
        tipo: "text",
        payload: msg.message,
        dhEnvio: new Date(msg.whatsapp.timestamp * 1000)
      })

      // socket realtime
      io.emit("NEW_MESSAGE", {
        idChat,
        conteudo: body,
        fromMe: true,
        telefone
      })

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