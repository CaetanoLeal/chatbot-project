const axios = require("axios");
const logger = require("../../logger");
const env = require("../config/env");

const TIMEOUT = env.http.timeout;

async function sendWhatsAppMessage({
  telefone,
  message,
  instanceName
}) {
  try {

    const instance =
      instanceName ||
      env.instances.defaultWhatsappInstance;

    const url =
      `${env.apis.whatsapp}` +
      `/instances/${instance}` +
      `${env.routes.whatsappMessageRoute}`;

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
      `${env.apis.telegram}` +
      `${env.routes.telegramMessageRoute}`;

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