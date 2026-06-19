/**
 * src/server.js
 *
 * Servidor principal — webhook WhatsApp + Telegram
 * Refatorado para usar funil.helper.js com nova modelagem.
 */

"use strict"

const express    = require("express")
const bodyParser = require("body-parser")
const dotenv     = require("dotenv")
const cors       = require("cors")
const http       = require("http")
const { Server } = require("socket.io")

const logger      = require("../logger")
const funil       = require("./helpers/funil.helper")
const routes      = require("./routes")
const sendMessage = require("./services/sendMessage")
const chatService = require("./services/chatService")

const TelegramMessageModel = require("./models/TelegramMessageModel")
const MessageModels        = require("./models/MessageModel")
const InstanceModel        = require("./models/InstanceModel")

dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use("/api", routes)

/* ============================================================
   HELPERS INTERNOS DO WEBHOOK
   ============================================================ */

/** Resolve a instância ou retorna null e loga aviso. */
async function resolverInstancia(instanceName, res) {
  const instancia = await InstanceModel.getByName(instanceName)
  if (!instancia) {
    logger.warn(`⚠️ Instância não encontrada: ${instanceName}`)
  }
  return instancia
}

/** Faz emit no socket e salva mensagem unificada. */
async function registrarMensagem({ idChat, cdProvider, idMensagemExterna, fromMe, conteudo, tipo, payload, dhEnvio, io, contato }) {
  await chatService.saveUnifiedMessage({
    idChat, cdProvider, idMensagemExterna, fromMe, conteudo, tipo, payload, dhEnvio
  })
  io.emit("NEW_MESSAGE", { idChat, conteudo, fromMe, contato })
}

/* ============================================================
   WEBHOOK
   ============================================================ */
app.post("/webhook", async (req, res) => {
  // Responde imediatamente para não travar o provider
  res.status(200).json({ success: true })

  const msg = req.body

  try {

    /* ─────────────────────────────────────────────
       EVENTOS DE INSTÂNCIA
    ───────────────────────────────────────────── */
    if (msg.event === "instance.created") {
      await InstanceModel.saveOrUpdateInstance({
        no_instancia  : msg.instance?.name,
        cd_provider   : msg.provider === "whatsapp" ? InstanceModel.PROVIDER.WHATSAPP : InstanceModel.PROVIDER.TELEGRAM,
        cd_status     : InstanceModel.STATUS.INATIVO,
        ds_webhook    : msg.webhook || null,
        ds_auth_path  : msg.ds_auth_path || null,
        id_funil      : msg.id_funil || null,
      })
      return
    }

    if (msg.event === "instance.connected") {
      await InstanceModel.saveOrUpdateInstance({
        no_instancia   : msg.instance?.name,
        cd_provider    : msg.provider === "whatsapp" ? InstanceModel.PROVIDER.WHATSAPP : InstanceModel.PROVIDER.TELEGRAM,
        cd_status      : InstanceModel.STATUS.ATIVO,
        session_string : msg.session_string || null,
        nu_telefone    : msg.phoneNumber || null,
        ds_webhook     : msg.webhook || null,
        ds_foto_perfil : msg.profilePicture || null,
        ds_auth_path   : msg.ds_auth_path || null,
        id_funil       : msg.id_funil || null,
      })
      io.emit("INSTANCE_CONNECTED", { nome: msg.instance?.name, telefone: msg.phoneNumber })
      return
    }

    if (msg.event === "instance.disconnected") {
      await InstanceModel.saveOrUpdateInstance({
        no_instancia : msg.instance?.name,
        cd_provider  : msg.provider === "whatsapp" ? InstanceModel.PROVIDER.WHATSAPP : InstanceModel.PROVIDER.TELEGRAM,
        cd_status    : InstanceModel.STATUS.DESCONECTADO,
      })
      io.emit("INSTANCE_DISCONNECTED", { nome: msg.instance?.name })
      return
    }

    /* ─────────────────────────────────────────────
       TELEGRAM — MENSAGEM RECEBIDA (entrada do usuário)
    ───────────────────────────────────────────── */
    if (msg.event === "message.received" && msg.provider === "telegram") {
      const message = msg.message

      /* Mensagens enviadas pelo próprio bot (out = true) → apenas registra */
      if (message.out === true) {
        const userId = message.peerId?.userId?.toString()
        if (!userId) return

        const idUtilizador = await funil.getOrCreateUtilizador({ cdTelegram: userId })
        const instancia    = await resolverInstancia(msg.instance?.name)
        if (!instancia) return

        const idChat = await chatService.getOrCreateChat({
          idUtilizador,
          cdProvider  : 2,
          idInstancia : instancia.id_instancia,
        })

        await chatService.updateChatContactInfo({ idChat, fotoPerfil: msg.contact?.photo || null, lastSeen: null })

        await registrarMensagem({
          idChat,
          cdProvider        : 2,
          idMensagemExterna : message.id?.toString(),
          fromMe            : true,
          conteudo          : message.message || "[mensagem não textual]",
          tipo              : "text",
          payload           : msg,
          dhEnvio           : message.date ? new Date(message.date * 1000) : new Date(),
          io,
          contato           : userId,
        })
        return
      }

      /* Mensagem recebida do usuário */
      await TelegramMessageModel.saveTelegramMessage(message)

      const telegramUserId = message.fromId?.userId?.toString()
      if (!telegramUserId) return

      const nome = msg.contact?.firstName
        ? `${msg.contact.firstName} ${msg.contact.lastName ?? ""}`.trim()
        : null

      const idUtilizador = await funil.getOrCreateUtilizador({ cdTelegram: telegramUserId, nome })

      const instancia = await resolverInstancia(msg.instance?.name)
      if (!instancia) return

      const idChat = await chatService.getOrCreateChat({
        idUtilizador,
        cdProvider  : 2,
        idInstancia : instancia.id_instancia,
      })

      const dhEnvio  = msg.message?.date ? new Date(msg.message.date * 1000) : new Date()
      const conteudo = msg.message?.message || "[mensagem não textual]"

      await registrarMensagem({
        idChat,
        cdProvider        : 2,
        idMensagemExterna : msg.message?.id?.toString(),
        fromMe            : false,
        conteudo,
        tipo              : "text",
        payload           : msg,
        dhEnvio,
        io,
        contato           : telegramUserId,
      })

      /* ---- Motor do funil ---- */
      await funil.processarMensagem({
        idUtilizador,
        idFunil     : instancia.id_funil,
        idChat,
        texto       : conteudo,
        sendMessage : (text) =>
          sendMessage.sendTelegramMessage({
            chatId       : telegramUserId,
            message      : text,
            instanceName : msg.instance?.name,
          }),
      })

      return
    }

    /* ─────────────────────────────────────────────
       TELEGRAM — MENSAGEM ENVIADA (confirmação)
    ───────────────────────────────────────────── */
    if (msg.event === "message.sent" && msg.provider === "telegram") {
      const message = msg.message

      const userId = (
        msg.telegram?.peerId?.userId ||
        msg.telegram?.peerId?.chatId ||
        msg.telegram?.peerId?.channelId
      )?.toString()

      if (!userId) return

      const idUtilizador = await funil.getOrCreateUtilizador({ cdTelegram: userId })

      const instancia = await resolverInstancia(msg.instance?.name)
      if (!instancia) return

      const idChat = await chatService.getOrCreateChat({
        idUtilizador,
        cdProvider  : 2,
        idInstancia : instancia.id_instancia,
      })

      await registrarMensagem({
        idChat,
        cdProvider        : 2,
        idMensagemExterna : msg.telegram?.messageId?.toString(),
        fromMe            : true,
        conteudo          : message?.text || "[mensagem não textual]",
        tipo              : "text",
        payload           : msg,
        dhEnvio           : msg.telegram?.date ? new Date(msg.telegram.date * 1000) : new Date(),
        io,
        contato           : userId,
      })

      return
    }

    /* ─────────────────────────────────────────────
       WHATSAPP — MENSAGEM RECEBIDA
    ───────────────────────────────────────────── */
    if (msg.event === "message.received" && msg.whatsapp && msg.message) {
      const jid = msg.whatsapp?.jid

      /* Ignora grupos, status e mensagens do próprio bot */
      if (
        jid?.endsWith("@g.us") ||
        funil.isStatusBroadcast(jid, msg.whatsapp?.jidAlt, msg.message?.raw?.key?.remoteJid, msg.message?.raw?.key?.participant) ||
        msg.message?.raw?.key?.fromMe ||
        msg.message?.raw?.protocolMessage
      ) {
        return
      }

      const body = msg.message.text || ""
      if (!body) return

      await MessageModels.saveMessageFromBaileys(msg)

      const telefone = funil.extrairNumeroWhatsapp({
        jid    : msg.whatsapp.jid,
        jidAlt : msg.whatsapp.jidAlt,
      })

      if (!telefone) {
        logger.warn("⚠️ Não foi possível extrair número do WhatsApp")
        return
      }

      const nome         = msg.whatsapp?.pushName || telefone
      const idUtilizador = await funil.getOrCreateUtilizador({ cdWhatsapp: telefone, telefone, nome })

      const instancia = await resolverInstancia(msg.instance?.name)
      if (!instancia) return

      const idChat = await chatService.getOrCreateChat({
        idUtilizador,
        cdProvider  : 1,
        idInstancia : instancia.id_instancia,
      })

      await chatService.updateChatContactInfo({
        idChat,
        fotoPerfil : msg.whatsapp?.profilePicture || null,
        lastSeen   : msg.whatsapp?.lastSeen ? new Date(msg.whatsapp.lastSeen * 1000) : null,
      })

      const ts      = Number(msg.whatsapp?.timestamp)
      const dhEnvio = !isNaN(ts) ? new Date(ts * 1000) : new Date()

      await registrarMensagem({
        idChat,
        cdProvider        : 1,
        idMensagemExterna : msg.whatsapp?.messageId,
        fromMe            : false,
        conteudo          : body,
        tipo              : "text",
        payload           : msg.message,
        dhEnvio,
        io,
        contato           : telefone,
      })

      /* ---- Motor do funil ---- */
      await funil.processarMensagem({
        idUtilizador,
        idFunil     : instancia.id_funil,
        idChat,
        texto       : body,
        sendMessage : (text) =>
          sendMessage.sendWhatsAppMessage({
            telefone,
            message      : text,
            instanceName : msg.instance?.name,
          }),
      })

      return
    }

    /* ─────────────────────────────────────────────
       WHATSAPP — MENSAGEM ENVIADA (confirmação)
    ───────────────────────────────────────────── */
    if (msg.event === "message.sent" && msg.whatsapp && msg.message) {
      const body = msg.message.text || ""

      const telefone = funil.extrairNumeroWhatsapp({
        jid    : msg.whatsapp.jid,
        jidAlt : msg.whatsapp.jidAlt,
      })

      if (!telefone) return

      const idUtilizador = await funil.getOrCreateUtilizador({ cdWhatsapp: telefone, telefone })

      const instancia = await resolverInstancia(msg.instance?.name)
      if (!instancia) return

      const idChat = await chatService.getOrCreateChat({
        idUtilizador,
        cdProvider  : 1,
        idInstancia : instancia.id_instancia,
      })

      await registrarMensagem({
        idChat,
        cdProvider        : 1,
        idMensagemExterna : msg.whatsapp?.messageId,
        fromMe            : true,
        conteudo          : body,
        tipo              : "text",
        payload           : msg.message,
        dhEnvio           : new Date(msg.whatsapp.timestamp * 1000),
        io,
        contato           : telefone,
      })

      return
    }

  } catch (err) {
    logger.error(`❌ Webhook error: ${err.message}`, { stack: err.stack })
  }
})

/* ============================================================
   ROTAS PADRÃO
   ============================================================ */
app.get("/", (_, res) => res.send("🚀 API de Mensagens ativa e rodando!"))

app.use((err, req, res, next) => {
  logger.error("🔥 Erro não tratado:", err)
  return res.status(500).json({ success: false, message: "Erro interno do servidor" })
})

app.use((req, res) => {
  return res.status(404).json({ success: false, message: "Rota não encontrada" })
})

/* ============================================================
   HTTP + SOCKET.IO
   ============================================================ */
const server = http.createServer(app)
const io     = new Server(server, { cors: { origin: "*" } })

const PORT = process.env.PORT || 3001

server.listen(PORT, "0.0.0.0", () =>
  logger.info(`🚀 Servidor rodando na porta ${PORT}`)
)