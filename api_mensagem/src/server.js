const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const logger = require("../logger");

const MessageModel = require("./models/MessageModel");

dotenv.config();

const app = express();
app.use(bodyParser.json()); // permite receber JSON no body

// Rota Webhook
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body;

    // Salva mensagem no banco
    const saved = await MessageModel.saveMessage(msg);

    logger.info(`Mensagem registrada com sucesso: ${JSON.stringify(msg)}`);

    res.status(201).json({
      success: true,
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
