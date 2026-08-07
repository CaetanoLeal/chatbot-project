/**
 * src/server.js
 *
 * Servidor principal — webhook WhatsApp + Telegram
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
const db                   = require("./config/db")

dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use("/api", routes)

/* ============================================================
   HTTP + SOCKET.IO  (precisa estar antes de ser usado no webhook)
   ============================================================ */
const server = http.createServer(app)
const io     = new Server(server, { cors: { origin: "*" } })

const socketBus = require("./socket")
socketBus.setIO(io)

/* ============================================================
   HELPERS INTERNOS DO WEBHOOK
   ============================================================ */

/** Resolve a instância ou retorna null e loga aviso. */
async function resolverInstancia(instanceName) {
  const instancia = await InstanceModel.getByName(instanceName)
  if (!instancia) logger.warn(`⚠️ Instância não encontrada: ${instanceName}`)
  return instancia
}

/** Emite no socket e salva mensagem unificada. */
async function registrarMensagem({
  idChat, cdProvider, idMensagemExterna, fromMe,
  conteudo, tipo, payload, dhEnvio, contato,
}) {
  await chatService.saveUnifiedMessage({
    idChat, cdProvider, idMensagemExterna, fromMe, conteudo, tipo, payload, dhEnvio,
  })
  io.emit("NEW_MESSAGE", { idChat, conteudo, fromMe, contato })
}

/* ============================================================
   WEBHOOK
   ============================================================ */
app.post("/webhook", async (req, res) => {
  res.status(200).json({ success: true })

  const msg = req.body

  try {

    /* ─────────────────────────────────────────────
       EVENTOS DE INSTÂNCIA
    ───────────────────────────────────────────── */
    if (msg.event === "instance.created") {
      await InstanceModel.saveOrUpdateInstance({
        no_instancia : msg.instance?.name,
        cd_provider  : msg.provider === "whatsapp" ? InstanceModel.PROVIDER.WHATSAPP : InstanceModel.PROVIDER.TELEGRAM,
        cd_status    : InstanceModel.STATUS.INATIVO,
        ds_webhook   : msg.webhook || null,
        ds_auth_path : msg.ds_auth_path || null,
        id_funil     : msg.id_funil || null,
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
       TELEGRAM — MENSAGEM RECEBIDA
    ───────────────────────────────────────────── */
    if (msg.event === "message.received" && msg.provider === "telegram") {
      const message = msg.message

      /* Mensagens enviadas pelo próprio bot/atendente → apenas registra,
         mas verifica se isso tira o utilizador do status PENDENTE. */
      if (message.out === true) {
        const userId = message.peerId?.userId?.toString()
        if (!userId) return

        const idUtilizador = await funil.getUtilizadorExistente({ cdTelegram: userId })
        if (!idUtilizador) return // chat ainda não existe → não cria nada

        const instancia = await resolverInstancia(msg.instance?.name)
        if (!instancia) return

        const idChat = await chatService.getChatExistente({
          idUtilizador,
          cdProvider  : 2,
          idInstancia : instancia.id_instancia,
        })
        if (!idChat) return

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
          contato           : userId,
        })

        await funil.verificarRespostaHumanaPendente({ idUtilizador, idFunil: instancia.id_funil })
        return
      }

      /* Mensagem recebida do utilizador */
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

      const dhEnvio  = message.date ? new Date(message.date * 1000) : new Date()
      const conteudo = message.message || "[mensagem não textual]"

      await registrarMensagem({
        idChat,
        cdProvider        : 2,
        idMensagemExterna : message.id?.toString(),
        fromMe            : false,
        conteudo,
        tipo              : "text",
        payload           : msg,
        dhEnvio,
        contato           : telegramUserId,
      })

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

      const idUtilizador = await funil.getUtilizadorExistente({ cdTelegram: userId })
      if (!idUtilizador) return

      const instancia = await resolverInstancia(msg.instance?.name)
      if (!instancia) return

      const idChat = await chatService.getChatExistente({
        idUtilizador,
        cdProvider  : 2,
        idInstancia : instancia.id_instancia,
      })
      if (!idChat) return

      await registrarMensagem({
        idChat,
        cdProvider        : 2,
        idMensagemExterna : msg.telegram?.messageId?.toString(),
        fromMe            : true,
        conteudo          : message?.text || "[mensagem não textual]",
        tipo              : "text",
        payload           : msg,
        dhEnvio           : msg.telegram?.date ? new Date(msg.telegram.date * 1000) : new Date(),
        contato           : userId,
      })

      await funil.verificarRespostaHumanaPendente({ idUtilizador, idFunil: instancia.id_funil })
      return
    }

    /* ─────────────────────────────────────────────
       WHATSAPP — MENSAGEM RECEBIDA
    ───────────────────────────────────────────── */
    if (msg.event === "message.received" && msg.whatsapp && msg.message) {
      const jid = msg.whatsapp?.jid

      if (
        jid?.endsWith("@g.us") ||
        jid?.endsWith("@newsletter") ||
        funil.isStatusBroadcast(
          jid,
          msg.whatsapp?.jidAlt,
          msg.message?.raw?.key?.remoteJid,
          msg.message?.raw?.key?.participant
        ) ||
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
        contato           : telefone,
      })

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
      const telefone = funil.extrairNumeroWhatsapp({
        jid    : msg.whatsapp.jid,
        jidAlt : msg.whatsapp.jidAlt,
      })

      if (!telefone) return

      const idUtilizador = await funil.getUtilizadorExistente({ cdWhatsapp: telefone })
      if (!idUtilizador) return // chat ainda não existe → não cria nada

      const instancia = await resolverInstancia(msg.instance?.name)
      if (!instancia) return

      const idChat = await chatService.getChatExistente({
        idUtilizador,
        cdProvider  : 1,
        idInstancia : instancia.id_instancia,
      })
      if (!idChat) return

      await registrarMensagem({
        idChat,
        cdProvider        : 1,
        idMensagemExterna : msg.whatsapp?.messageId,
        fromMe            : true,
        conteudo          : msg.message.text || "[mensagem não textual]",
        tipo              : "text",
        payload           : msg.message,
        dhEnvio           : new Date(msg.whatsapp.timestamp * 1000),
        contato           : telefone,
      })

      await funil.verificarRespostaHumanaPendente({ idUtilizador, idFunil: instancia.id_funil })
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
   START E ROTINAS DE BACKGROUND (CRON)
   ============================================================ */
const PORT = process.env.PORT || 3001

server.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`)

  /* ============================================================
     ROTINA CRON DE EXPIRAÇÃO (A cada 60 segundos)
     Continua restrita a utilizadores em CADASTRO/CHATBOT (C/B) —
     ver verificarEProcessarExpiracoes no funil.helper.js
     ============================================================ */
  setInterval(async () => {
    logger.info("🔍 Verificando sessões inativas do funil...")
    
    await funil.verificarEProcessarExpiracoes(async (idUtilizador, texto) => {
      try {
        const rUser = await db.query(
          `SELECT nu_telefone, cd_telegram, cd_whatsapp FROM tbl_utilizador WHERE id_utilizador = $1`,
          [idUtilizador]
        )
        if (rUser.rows.length === 0) return
        const user = rUser.rows[0]

        const rChat = await db.query(
          `SELECT C.cd_provider, I.no_instancia
             FROM tbl_chat C
            INNER JOIN tbl_instancia I ON I.id_instancia = C.id_instancia
            WHERE C.id_utilizador = $1
            ORDER BY C.dh_ultima_mensagem DESC LIMIT 1`,
          [idUtilizador]
        )
        if (rChat.rows.length === 0) return
        const chat = rChat.rows[0]

        if (chat.cd_provider === 1 && user.cd_whatsapp) {
          await sendMessage.sendWhatsAppMessage({
            telefone: user.cd_whatsapp,
            message: texto,
            instanceName: chat.no_instancia
          })
        } else if (chat.cd_provider === 2 && user.cd_telegram) {
          await sendMessage.sendTelegramMessage({
            chatId: user.cd_telegram,
            message: texto,
            instanceName: chat.no_instancia
          })
        }

      } catch (err) {
        logger.error(`❌ Falha ao enviar mensagem de expiração para o ID ${idUtilizador}:`, err)
      }
    })
  }, 60000) // 60000 ms = 1 minuto
})