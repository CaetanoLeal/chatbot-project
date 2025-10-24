const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const logger = require("../logger");

const MessageModel = require("./models/MessageModel");
const TelegramMessageModel = require("./models/TelegramMessageModel");

dotenv.config();

const app = express();
app.use(bodyParser.json());

// 🔹 Endpoint principal de webhook
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body;

    // 🟦 1. Detecta automaticamente se é mensagem do Telegram ou WhatsApp
    if (msg.className === "Message" && msg.peerId) {
      // --- TELEGRAM ---
      const saved = await TelegramMessageModel.saveTelegramMessage(msg);
      logger.info(`📩 Mensagem TELEGRAM registrada com sucesso: ${JSON.stringify(msg)}`);

      return res.status(201).json({
        success: true,
        source: "telegram",
        message: "Mensagem Telegram registrada com sucesso!",
        data: saved
      });
    }

    if (msg._data) {
      // --- WHATSAPP ---
      const saved = await MessageModel.saveMessage(msg);
      logger.info(`💬 Mensagem WHATSAPP registrada com sucesso: ${JSON.stringify(msg)}`);

      return res.status(201).json({
        success: true,
        source: "whatsapp",
        message: "Mensagem WhatsApp registrada com sucesso!",
        data: saved
      });
    }

    // 🟨 Caso o formato da mensagem não seja reconhecido
    logger.warn(`Formato desconhecido recebido no webhook: ${JSON.stringify(msg)}`);
    return res.status(400).json({
      success: false,
      message: "Formato de mensagem não reconhecido",
      received: msg
    });

  } catch (err) {
    logger.error(`❌ Erro ao processar webhook: ${err.message}`, { stack: err.stack });
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Rota de teste (opcional)
app.get("/", (req, res) => {
  res.send("🚀 API de Mensagens ativa e rodando!");
});

// 🔹 Inicialização do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
});
