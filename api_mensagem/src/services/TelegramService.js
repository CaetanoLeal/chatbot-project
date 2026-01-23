const FunilService = require("./FunilService");
const TelegramMessageModel = require("../models/TelegramMessageModel");
const axios = require("axios");

class TelegramService {
  static async process(msg) {
    if (msg.out) return;

    await TelegramMessageModel.saveTelegramMessage(msg);

    const telegramId = msg.fromId?.userId?.toString();
    if (!telegramId) return;

    const idUtilizador = await FunilService.getOrCreateUtilizador({
      telegramId
    });

    const funil = await FunilService.getOrCreateFunilUtilizador(idUtilizador);
    const mensagem = await FunilService.getMensagem(funil.cd_mensagem_cadastro);

    if (!mensagem) return;

    await axios.post("http://telegram-bot:3002/send-message", {
      userId: telegramId,
      message: mensagem.ds_mensagem
    });
  }
}

module.exports = TelegramService;
