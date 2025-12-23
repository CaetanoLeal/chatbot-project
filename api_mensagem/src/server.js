// server.js
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");
const logger = require("../logger");
const db = require("./config/db"); // conexão com PostgreSQL
const MessageModel = require("./models/MessageModel");
const TelegramMessageModel = require("./models/TelegramMessageModel");
const { v4: uuidv4 } = require("uuid");

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Funil padrão (substitua se for variável/config)
const DEFAULT_FUNIL_ID = "e1e4748f-aa5b-4981-8694-81dc5aabde9c";

// Helper: envia mensagem pro microserviço do telegram
async function sendToTelegramService({ nome, userId, message, buttons }) {
  try {
    const payload = { nome, userId, message };
    if (buttons) payload.buttons = buttons;
    await axios.post("http://telegram-bot:3002/send-message", payload, { timeout: 8000 });
    logger.info("📤 Mensagem enviada ao serviço telegram-bot");
  } catch (err) {
    logger.error(`❌ Erro ao enviar para telegram-bot: ${err.message}`);
  }
}

app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body;
    logger.info(`📦 Conteúdo recebido no webhook:\n${JSON.stringify(msg, null, 2)}`);

    // ---- TELEGRAM ----
    if (msg.className === "Message" && msg.peerId) {
      // Ignorar mensagens de grupo/canal
      if (msg.peerId.className !== "PeerUser") {
        logger.info(`Mensagem ignorada de grupo/canal: peerId.className = ${msg.peerId.className}`);
        return res.status(200).json({ success: true, source: "telegram", message: "Mensagem de grupo/canal ignorada." });
      }

      // Ignorar ações de digitação/ações
      if (msg.className === "MessageAction" || msg.action?.className === "MessageActionTyping") {
        logger.info("Mensagem de ação ignorada");
        return res.status(200).json({ success: true, source: "telegram", message: "Mensagem de ação ignorada." });
      }

      // Gravar mensagem raw no DB
      try {
        await TelegramMessageModel.saveTelegramMessage(msg);
      } catch (err) {
        logger.warn(`Falha ao salvar TelegramMessage (não crítico): ${err.message}`);
      }

      const text = msg.message || "";
      const isOutgoing = msg.out === true;

      // Mensagens enviadas pelo próprio bot -> ignorar
      if (isOutgoing) {
        logger.info("Mensagem enviada pelo bot, ignorando");
        return res.status(200).json({ success: true, source: "telegram", message: "Mensagem enviada." });
      }

      // Mensagem recebida de usuário
      const telegramUserId = msg.fromId?.userId?.toString();
      if (!telegramUserId) {
        logger.warn("Mensagem sem fromId.userId. Ignorando.");
        return res.status(400).json({ success: false, message: "fromId.userId ausente" });
      }

      // ===== Etapa 1: obter ou criar utilizador =====
      let vIdUtilizador;
      try {
        const rUser = await db.query("SELECT id_utilizador FROM tbl_utilizador WHERE cd_telegram = $1", [telegramUserId]);
        if (rUser.rows.length > 0) {
          vIdUtilizador = rUser.rows[0].id_utilizador;
          logger.info(`✅ Utilizador já existente (${vIdUtilizador})`);
        } else {
          vIdUtilizador = uuidv4();
          await db.query(
            `INSERT INTO tbl_utilizador (id_utilizador, cd_telegram) VALUES ($1, $2)`,
            [vIdUtilizador, telegramUserId]
          );
          logger.info(`🆕 Novo utilizador cadastrado (${vIdUtilizador})`);
        }
      } catch (err) {
        logger.error(`❌ Erro ao obter/criar utilizador: ${err.message}`);
        return res.status(500).json({ success: false, message: "Erro ao processar utilizador" });
      }

      // ===== Etapa 2: obter ou criar registro em tbl_funil_utilizador para este funil =====
      const vIdFunil = DEFAULT_FUNIL_ID;
      let funilUtilizador = null;
      let cdMensagemCadastro = 0;
      let cdMensagemChatbot = 0;
      let idFunilUtilizador = null;

      try {
        const vIsFunilUtilizador = await db.query(
          `SELECT * FROM tbl_funil_utilizador WHERE id_utilizador = $1 AND id_funil = $2 ORDER BY dh_mensagem DESC LIMIT 1`,
          [vIdUtilizador, vIdFunil]
        );

        if (vIsFunilUtilizador.rows.length > 0) {
          funilUtilizador = vIsFunilUtilizador.rows[0];
          idFunilUtilizador = funilUtilizador.id_funil_utilizador;
          cdMensagemCadastro = funilUtilizador.cd_mensagem_cadastro ?? 0;
          cdMensagemChatbot = funilUtilizador.cd_mensagem_chatbot ?? 0;
          logger.info(`✅ Funil utilizador existente: ${idFunilUtilizador} (cd_mensagem_cadastro=${cdMensagemCadastro})`);
        } else {
          // criar novo funil_utilizador
          idFunilUtilizador = uuidv4();
          const dhMensagem = new Date();
          const dhExpiracao = new Date(dhMensagem.getTime() + (global.gExpirarMinutos ?? 60) * 60000); // fallback 60min
          cdMensagemCadastro = 0;
          cdMensagemChatbot = 0;
          await db.query(
            `INSERT INTO tbl_funil_utilizador
             (id_funil_utilizador, id_funil, id_utilizador, cd_mensagem_cadastro, cd_mensagem_chatbot, dh_mensagem, dh_expiracao)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [idFunilUtilizador, vIdFunil, vIdUtilizador, cdMensagemCadastro, cdMensagemChatbot, dhMensagem, dhExpiracao]
          );
          logger.info(`🆕 Inserido tbl_funil_utilizador (${idFunilUtilizador}) com cd_mensagem_cadastro=${cdMensagemCadastro}`);
        }
      } catch (err) {
        logger.error(`❌ Erro ao obter/criar tbl_funil_utilizador: ${err.message}`);
        return res.status(500).json({ success: false, message: "Erro ao processar funil do utilizador" });
      }

      // ===== Etapa 3: recuperar conteúdo da mensagem do funil (mensagem + botões) =====
      try {
        // Obter a mensagem do funil para a etapa corrente
        const msgQuery = await db.query(
          `SELECT id_funil_cadastro, ds_mensagem, cd_mensagem_destino
           FROM tbl_funil_cadastro
           WHERE id_funil = $1 AND cd_mensagem = $2
           LIMIT 1`,
          [vIdFunil, cdMensagemCadastro]
        );

        if (msgQuery.rows.length === 0) {
          logger.warn(`Mensagem de funil não encontrada para cd_mensagem=${cdMensagemCadastro}`);
          return res.status(200).json({ success: false, message: "Etapa de funil não configurada" });
        }

        const funilCadastroRow = msgQuery.rows[0];
        const idFunilCadastro = funilCadastroRow.id_funil_cadastro;
        const textoMensagem = funilCadastroRow.ds_mensagem || "Escolha uma opção:";

        // Buscar botões ligados a essa mensagem específica (id_funil_cadastro)
        const vBotaoQuery = await db.query(
          `SELECT cd_botao, ds_botao FROM tbl_funil_cadastro_botao WHERE id_funil_cadastro = $1 ORDER BY cd_botao`,
          [idFunilCadastro]
        );

        const userId = telegramUserId; // para o microserviço telegram

        if (vBotaoQuery.rows.length > 0) {
          // montar botões com callback_data (importante)
          const buttons = vBotaoQuery.rows.map(b => ({
            text: b.ds_botao,
            callback_data: String(b.cd_botao)
          }));

          // enviar como teclado inline
          await sendToTelegramService({ nome: "teste", userId, message: textoMensagem, buttons });

          // não atualizar cd_mensagem_cadastro aqui automaticamente — esperar ação do usuário (botão/callback)
          // mas atualizamos dh_mensagem para registar a hora do envio
          await db.query(
            `UPDATE tbl_funil_utilizador SET dh_mensagem = $1 WHERE id_funil_utilizador = $2`,
            [new Date(), idFunilUtilizador]
          );
        } else {
          // não há botões: enviar texto e avançar para a próxima pergunta do funil
          await sendToTelegramService({ nome: "teste", userId, message: textoMensagem });

          // avançar automaticamente para próxima mensagem do funil (ex.: pedir telefone)
          const proximoCd = Number(cdMensagemCadastro) + 1;
          // Atualiza o registro do funil do utilizador para próxima etapa e registra dh_mensagem
          await db.query(
            `UPDATE tbl_funil_utilizador
             SET cd_mensagem_cadastro = $1, dh_mensagem = $2
             WHERE id_funil_utilizador = $3`,
            [proximoCd, new Date(), idFunilUtilizador]
          );

          // Enviar a próxima mensagem imediatamente (opcional) — se preferir só enviar quando o usuário responder, remova este bloco
          const nextMsgQuery = await db.query(
            `SELECT ds_mensagem FROM tbl_funil_cadastro WHERE id_funil = $1 AND cd_mensagem = $2 LIMIT 1`,
            [vIdFunil, proximoCd]
          );
          if (nextMsgQuery.rows.length > 0) {
            await sendToTelegramService({
              nome: "teste",
              userId,
              message: nextMsgQuery.rows[0].ds_mensagem
            });

            // registra que avançou
            await db.query(
              `UPDATE tbl_funil_utilizador SET dh_mensagem = $1 WHERE id_funil_utilizador = $2`,
              [new Date(), idFunilUtilizador]
            );
          }
        }

        return res.status(200).json({ success: true, source: "telegram", message: "Mensagem processada." });
      } catch (err) {
        logger.error(`❌ Erro no processamento do funil: ${err.message}`);
        return res.status(500).json({ success: false, message: "Erro ao processar etapa do funil" });
      }
    }

    // ---- WHATSAPP ----
    if (msg._data) {
// ====================== DEBUG COMPLETO DO WHATSAPP ======================

// Loga TODO o msg cru
console.log("\n==============================================");
console.log("📦 MSG COMPLETO RECEBIDO DO WHATSAPP:");
console.log("==============================================");
console.log(JSON.stringify(msg, null, 2));

// Loga apenas o ._data
console.log("\n==============================================");
console.log("🧩 msg._data (WhatsApp API RAW):");
console.log("==============================================");
console.log(JSON.stringify(msg._data, null, 2));

// Mostrar todos os campos que serão enviados ao saveMessage
console.log("\n==============================================");
console.log("📝 CAMPOS MAPEADOS PARA O BANCO:");
console.log("==============================================");

console.log({
  id_mensagem: msg._data?.id?._serialized || null,
  id_chat: msg._data?.id?.remote || null,
  id_utilizador: null,
  from_me: msg._data?.id?.fromMe || false,
  remote: msg._data?.id?.remote || null,
  id_interno: msg._data?.id?.id || null,
  serialized_id: msg._data?.id?._serialized || null,
  body: msg._data?.body || null,
  type: msg._data?.type || null,
  timestamp: msg._data?.t || null,
  client_received_ts: msg._data?.clientUrl || null,  // ⚠️ provavelmente está errado
  ack: msg._data?.ack || null,
  from_number: msg._data?.from || null,
  to_number: msg._data?.to || null,
  author: msg._data?.author || null,
  notify_name: msg._data?.notifyName || null,
  is_starred: msg._data?.isStarred || false
});

console.log("====================================================================\n");

      const wa = msg._data;
      const vFrom = wa.from;
      const body = wa.body || "";
      const isFromMe = wa.id?.fromMe === true;

      // Ignorar mensagens enviadas pelo próprio bot
      if (isFromMe) {
        logger.info("Mensagem WhatsApp enviada pelo bot, ignorando");
        return res.status(200).json({
          success: true,
          source: "whatsapp",
          message: "Mensagem enviada."
        });
      }

      // etapa 1 — salvar mensagem no banco
          let saved;
          try {
            saved = await MessageModel.saveMessage(msg);

            logger.info("💬 Mensagem WHATSAPP registrada com sucesso.");
          } catch (err) {
            logger.error(`❌ Erro ao salvar mensagem WhatsApp: ${err.message}`);
            return res.status(500).json({
              success: false,
              source: "whatsapp",
              message: "Erro ao salvar mensagem WhatsApp"
            });
          }

          // etapa 2 — obter ou criar utilizador
          try {
            let vIdUtilizador;

            const rUser = await db.query(
              "SELECT id_utilizador FROM tbl_utilizador WHERE cd_whatsapp = $1",
              [vFrom]
            );

            if (rUser.rows.length > 0) {
              vIdUtilizador = rUser.rows[0].id_utilizador;
              logger.info(`✅ Utilizador já existe (${vIdUtilizador})`);
            } else {
              vIdUtilizador = uuidv4();

              await db.query(
                `INSERT INTO tbl_utilizador (id_utilizador, cd_whatsapp)
                VALUES ($1, $2)`,
                [vIdUtilizador, vFrom]
              );

              logger.info(`🆕 Novo utilizador cadastrado (${vIdUtilizador})`);
            }

            return res.status(201).json({
              success: true,
              source: "whatsapp",
              message: "Mensagem WhatsApp registrada com sucesso!",
              data: saved,
              user: vIdUtilizador
            });

          } catch (err) {
            logger.error(`❌ Erro ao obter/criar utilizador WhatsApp: ${err.message}`);
            return res.status(500).json({
              success: false,
              source: "whatsapp",
              message: "Erro ao processar utilizador"
            });
          }
        }

    // Formato desconhecido
    logger.warn(`⚠️ Formato desconhecido: ${JSON.stringify(msg)}`);
    return res.status(400).json({ success: false, message: "Formato de mensagem não reconhecido" });
  } catch (err) {
    logger.error(`❌ Erro no processamento do webhook: ${err.message}`);
    return res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
});

app.get("/", (req, res) => res.send("🚀 API de Mensagens ativa e rodando!"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => logger.info(`🚀 Servidor rodando na porta ${PORT}`));
