//server.js
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const logger = require("../logger");

const MessageModel = require("./models/MessageModel");
const TelegramMessageModel = require("./models/TelegramMessageModel");

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Função auxiliar para detectar a origem da mensagem
function detectarOrigemMensagem(msg) {
  if (msg?.message?.from || msg?._data?.id?._serialized) {
    return "whatsapp";
  } else if (msg?.className === "Message" || msg?.message_id) {
    return "telegram";
  } else {
    return "desconhecida";
  }
}

// Rota Webhook
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body;
    const origem = detectarOrigemMensagem(msg);

    let saved;

    if (origem === "whatsapp") {
      saved = await MessageModel.saveMessage(msg);
      logger.info("💬 Mensagem WhatsApp registrada com sucesso");
    } else if (origem === "telegram") {
      saved = await TelegramMessageModel.saveTelegramMessage(msg);
      logger.info("📨 Mensagem Telegram registrada com sucesso");
    } else {
      logger.warn("⚠️ Mensagem recebida com formato desconhecido");
      return res.status(400).json({ success: false, message: "Formato de mensagem não reconhecido" });
    }

    res.status(201).json({
      success: true,
      plataforma: origem,
      message: "Mensagem registrada com sucesso!",
      data: saved
    });
  } catch (err) {
    logger.error(`Erro ao processar webhook: ${err.message}`, { stack: err.stack });
    res.status(500).json({ success: false, error: err.message });
  }
});

// Porta
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
});
