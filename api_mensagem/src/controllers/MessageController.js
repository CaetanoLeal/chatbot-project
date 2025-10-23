//MessageController.js
const MessageModel = require("../models/MessageModel");
const logger = require("../logger");
 // ajuste o caminho conforme seu projeto

const MessageController = {
  async receive(req, res) {
    try {
      const msg = req.body; // webhook do wwebjs envia o objeto aqui

      // Log da mensagem recebida
      logger.info(`Webhook recebido: ${JSON.stringify(msg)}`);

      const saved = await MessageModel.saveMessage(msg);

      // Log da mensagem salva com sucesso
      logger.info(`Mensagem salva no banco: id_mensagem=${saved.id_mensagem}`);

      res.json({ success: true, saved });
    } catch (err) {
      // Log do erro com stack trace
      logger.error(`Erro ao processar mensagem: ${err.message}`, { stack: err.stack });
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = MessageController;
