// server.js
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");
const logger = require("../logger");
const db = require("./config/db"); // ✅ conexão com PostgreSQL

const MessageModel = require("./models/MessageModel");
const TelegramMessageModel = require("./models/TelegramMessageModel");
const e = require("express");

dotenv.config();

const app = express();
app.use(bodyParser.json());

let vStatus = '';

app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body;
    logger.info(`📦 Conteúdo recebido no webhook:\n${JSON.stringify(msg, null, 2)}`);

    // 🟦 TELEGRAM
    if (msg.className === "Message" && msg.peerId) {
      // Mensagens indesejadas - início
      if (msg.peerId.className !== "PeerUser") {
        logger.info(`Mensagem ignorada de grupo/canal: peerId.className = ${msg.peerId.className}`);
        return res.status(200).json({
          success: true,
          source: "telegram",
          message: "Mensagem de grupo/canal ignorada.",
          data: null,
        });
      }

      if (msg.className === "MessageAction" || msg.action?.className === "MessageActionTyping") {
        logger.info(`Mensagem ignorada de ação`);
        return res.status(200).json({
          success: true,
          source: "telegram",
          message: "Mensagem de ação ignorada.",
          data: null,
        });
      }
      // Mensagens indesejadas - fim

      // Gravar mensagem no banco de dados
      const saved = await TelegramMessageModel.saveTelegramMessage(msg);
      const vMensagem = msg.message || "";

      // Mensagens enviadas
      const isOutgoing = (msg.out === true);
      if (isOutgoing) {
        const vIdRemetente = msg.peerId?.userId?.toString();
        const vIdDestinatario = msg.fromId?.userId?.toString();
        logger.info(`👤 Remetente: ${vIdRemetente} | Destinatário: ${vIdDestinatario} | Mensagem: "${vMensagem}"`);

        logger.info(`Mensagem ignorada: mensagem enviada pelo próprio bot.`);
        return res.status(200).json({
          success: true,
          source: "telegram",
          message: "Mensagem enviada.",
          data: null,
        });
      }

      // Mensagens recebidas
      else {
        const vIdRemetente = msg.fromId?.userId?.toString();
        const vIdDestinatario = msg.peerId?.userId?.toString();
        logger.info(`👤 Remetente: ${vIdRemetente} | Destinatário: ${vIdDestinatario} | Mensagem: "${vMensagem}"`);

        // 🔹 Etapa 1: Verificar/Cadastrar na tbl_utilizador
        let vIdUtilizador = require('uuid').v4();
        let vIdFunil = 'e1e4748f-aa5b-4981-8694-81dc5aabde9c';

        db.query(
          "INSERT INTO tbl_utilizador(id_utilizador) VALUES ($1)",
          [vIdUtilizador]
        );
        try {
          const vIsUtilizador = await db.query(
            "SELECT id_utilizador FROM tbl_utilizador WHERE cd_telegram = $1",
            [vIdRemetente]
          );

          if (vIsUtilizador.rows.length > 0) {
            const vIdUtilizador = vIsUtilizador.rows[0].id_utilizador;
            logger.info(`✅ Utilizador já existente na tbl_utilizador (${vIdUtilizador})`);
          } else {
            const vIdUtilizador = '' + require('uuid').v4();
            await db.query(
              `INSERT INTO tbl_utilizador (id_utilizador, cd_telegram) VALUES ($1, $2)`,
              [vIdUtilizador, vIdRemetente]
            );
            logger.info(`🆕 Utilizador cadastrado em tbl_utilizador com id_utilizador = ${vIdUtilizador}`);
          }
        } catch (err) {
          logger.error(`❌ Erro ao verificar/cadastrar tbl_utilizador: ${err.message}`);
        }
        
        const vIsFunilUtilizador = await db.query(
          "SELECT id_funil_utilizador FROM tbl_funil_utilizador WHERE id_utilizador = $1",
          [vIdUtilizador]
      );

      
      // Etapa 2: Verificar/Cadastrar na tbl_funil_utilizador
      let vCdMensagemCadastro = 0;
      let vCdMensagemChatbot = 0;
      try {
           if (vIsFunilUtilizador.rows.length > 0) {
            const row = vIsFunilUtilizador.rows[0];
            vCdMensagemCadastro = row.cd_mensagem_cadastro;
            vCdMensagemChatbot = row.cd_mensagem_chatbot;
            const vIdFunilUtilizador = vIsFunilUtilizador.rows[0].id_funil_utilizador;
            const vCdMensagemCadastro = vIsFunilUtilizador.rows[0].cd_mensagem_cadastro;
            const vCdMensagemChatbot = vIsFunilUtilizador.rows[0].cd_mensagem_chatbot;
            logger.info(`✅ Funil Utilizador já existente na tbl_funil_utilizador (${vIdFunilUtilizador})`);
          } else {
            const { v4: uuidv4 } = await import('uuid');
            const vIdFunilUtilizador = uuidv4();
            const vDhExpiracao = new Date();
            vDhExpiracao.setMinutes(vDhExpiracao.getMinutes() + global.gExpirarMinutos);
            vCdMensagemCadastro = 1;
            vCdMensagemChatbot = 0;
            await db.query(
              `INSERT INTO tbl_funil_utilizador 
              (id_funil_utilizador, id_funil, id_utilizador, cd_mensagem_cadastro, cd_mensagem_chatbot, dh_mensagem, dh_expiracao) 
              VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [vIdFunilUtilizador, vIdFunil, vIdUtilizador, vCdMensagemCadastro, vCdMensagemChatbot, new Date(), vDhExpiracao]
            );
            logger.info(`🆕 Utilizador cadastrado em tbl_utilizador com id_utilizador = ${vIdUtilizador}`);
          }
        } catch (err) {
          logger.error(`❌ Erro ao verificar/cadastrar tbl_utilizador: ${err.message}`);
        }

        // Etapa de cadastramento
        if (vCdMensagemCadastro > 0) {
          const vMensagemCadastro = await db.query(
            "SELECT ds_mensagem, cd_mensagem_destino FROM tbl_funil_cadastro WHERE cd_mensagem = $1",
            [vCdMensagemCadastro]
          );
          const vMensagemTexto = vMensagemCadastro.rows[0]?.ds_mensagem;
          const vCdMensagemDestino = 0;
          const userId = vIdRemetente;
          // Recuperar botões
          if (vCdMensagemDestino === 0) {
            const vbotao = await db.query(
              "SELECT cd_botao, ds_botao FROM tbl_funil_cadastro_botao WHERE id_funil_cadastro = (SELECT id_funil_cadastro FROM tbl_funil_cadastro WHERE id_funil = $1) ORDER BY cd_botao",
              [vIdFunil]
            );
            let vMensagemTexto = '';

            if (vbotao.rows.length > 0) {
              vMensagemTexto += "\n\n *Escolha uma opção:* \n";
              for (const botao of vbotao.rows) {
                vMensagemTexto += `\n ${botao.cd_botao} - ${botao.ds_botao}`;
              }
            } else {
              vMensagemTexto += "\n\n(Nenhum botão configurado para este funil.)";
            }

            await axios.post("http://telegram-bot:3002/send-message", {
              nome: "teste",
              userId,
              message: vMensagemTexto,
            });
          } else {
            // Enviar mensagem e verificar aguardar resposta
            vStatus = 'AGUARDAR_RESPOSTA';
            await axios.post("http://telegram-bot:3002/send-message", {
              nome: "teste",
              userId,
              message: (await db.query(
                "SELECT ds_mensagem FROM tbl_funil_cadastro WHERE cd_mensagem = $1",
                [vCdMensagemCadastro]
              )).rows[0]?.ds_mensagem,
            });

            // 2. Perguntar telefone - Associar variável
            if (vStatus === 'AGUARDAR_RESPOSTA') {
              vStatus = 'ESPERAR_TELEFONE';
              await axios.post("http://telegram-bot:3002/send-message", {
                nome: "teste",
                userId,
                message: (await db.query(
                  "SELECT ds_mensagem FROM tbl_funil_cadastro WHERE cd_mensagem = $1",
                  [vCdMensagemCadastro + 1]
                )).rows[0]?.ds_mensagem,
              });
            }
          }

          return res.status(200).json({
            success: true,
            source: "telegram",
            message: "Mensagem recebida.",
            data: null,
          });
        }
      }
    }

    // 🟩 WHATSAPP
    if (msg._data) {
      const saved = await MessageModel.saveMessage(msg);
      logger.info(`💬 Mensagem WHATSAPP registrada com sucesso.`);
      return res.status(201).json({
        success: true,
        source: "whatsapp",
        message: "Mensagem WhatsApp registrada com sucesso!",
        data: saved,
      });
    }

    // 🟨 Desconhecido
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
