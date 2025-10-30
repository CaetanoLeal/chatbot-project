// server.js
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");
const logger = require("../logger");

const MessageModel = require("./models/MessageModel");
const TelegramMessageModel = require("./models/TelegramMessageModel");

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body;

    // 🔍 Log completo
    logger.info(`📦 Conteúdo recebido no webhook:\n${JSON.stringify(msg, null, 2)}`);

    // 🟦 TELEGRAM
    if (msg.className === "Message" && msg.peerId) {
      const saved = await TelegramMessageModel.saveTelegramMessage(msg);
      logger.info(`📩 Mensagem TELEGRAM registrada com sucesso: id=${msg.id}`);

      const userId = msg.peerId?.userId;
      const texto = msg.message || "";

      logger.info(`👤 Remetente identificado: ${userId} | Mensagem recebida: "${texto}"`);

      // ✅ Enviar mensagem de resposta
      try {
        await axios.post("http://telegram-bot:3002/send-message", {
          nome: "teste",
          userId, // ID do usuário que mandou a mensagem
          message: "bem vindo", // mensagem automática
        });
        logger.info(`🤖 Mensagem automática 'bem vindo' enviada para ${userId}`);
      } catch (err) {
        logger.error(`❌ Falha ao enviar mensagem automática para ${userId}: ${err.message}`);
      }

      return res.status(201).json({
        success: true,
        source: "telegram",
        message: "Mensagem Telegram registrada com sucesso!",
        data: saved,
      });
    }

    // 🟩 WHATSAPP
    if (msg._data) {
      const saved = await MessageModel.saveMessage(msg);
      logger.info(`💬 Mensagem WHATSAPP registrada com sucesso: ${JSON.stringify(msg)}`);

      return res.status(201).json({
        success: true,
        source: "whatsapp",
        message: "Mensagem WhatsApp registrada com sucesso!",
        data: saved,
      });
    }

    // 🟨 Mensagem desconhecida
    logger.warn(`⚠️ Formato desconhecido recebido no webhook: ${JSON.stringify(msg)}`);
    return res.status(400).json({
      success: false,
      message: "Formato de mensagem não reconhecido",
      received: msg,
    });

  } catch (err) {
    logger.error(`❌ Erro ao processar webhook: ${err.message}`, { stack: err.stack });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 API de Mensagens ativa e rodando!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
});
