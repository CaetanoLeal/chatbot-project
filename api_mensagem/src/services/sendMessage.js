// src/services/sendMessage.js
const axios = require("axios")
const logger = require("../../logger")

const TIMEOUT = 8000

async function sendWhatsAppMessage({ telefone, message }) {
  try {
    await axios.post(
      "http://chatbot-erp:3000/instances/caetano_bot/message",
      { number: telefone, message },
      { timeout: TIMEOUT }
    )
  } catch (err) {
    logger.error("❌ Erro ao enviar mensagem WhatsApp", {
      telefone,
      error: err.message
    })
    throw err
  }
}

async function sendTelegramMessage({ userId, message }) {
  try {
    await axios.post(
      "http://telegram-bot:3002/send-message",
      { nome: "Bot", userId, message },
      { timeout: TIMEOUT }
    )
  } catch (err) {
    logger.error("❌ Erro ao enviar mensagem Telegram", {
      userId,
      error: err.message
    })
    throw err
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendTelegramMessage
}
