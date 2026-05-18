const axios = require("axios");
const logger = require("../../logger");

require("dotenv").config();

const TIMEOUT =
  process.env.REQUEST_TIMEOUT || 15000;

async function sendWhatsAppMessage({
  telefone,
  message,
  instanceName
}) {
  try {

    const instance =
      instanceName ||
      process.env.DEFAULT_WHATSAPP_INSTANCE;

    const url =
      `${process.env.WHATSAPP_API_URL}` +
      `/instances/${instance}` +
      `${process.env.WHATSAPP_MESSAGE_ROUTE}`;

    await axios.post(
      url,
      {
        number: telefone,
        message
      },
      {
        timeout: TIMEOUT
      }
    );

  } catch (err) {

    logger.error(
      "❌ Erro ao enviar mensagem WhatsApp",
      {
        telefone,
        error: err.message
      }
    );

    throw err;
  }
}

async function sendTelegramMessage({
  userId,
  message,
  nome = "Sistema"
}) {

  try {

    const url =
      `${process.env.TELEGRAM_API_URL}` +
      `${process.env.TELEGRAM_MESSAGE_ROUTE}`;

    await axios.post(
      url,
      {
        nome,
        userId,
        message
      },
      {
        timeout: TIMEOUT
      }
    );

  } catch (err) {

    logger.error(
      "❌ Erro ao enviar mensagem Telegram",
      {
        userId,
        error: err.message
      }
    );

    throw err;
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendTelegramMessage
};