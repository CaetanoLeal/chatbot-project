// src/models/TelegramMessageModel.js
const pool = require("../config/db");
const logger = require("../../logger");

const TelegramMessageModel = {
  async saveTelegramMessage(msg) {
    const q = `
      INSERT INTO tbl_mensagem_telegram (
        id_mensagem, constructor_id, subclass_of_id,
        class_name, class_type, from_user_id, peer_user_id,
        out, mentioned, media_unread, silent,
        ttl_period, data_envio, mensagem,
        fwd_from, via_bot_id, reply_to,
        media, entities, views, forwards, replies,
        edit_date, pinned, grouped_id,
        restriction_reason, noforwards, created_at
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25,
        $26, $27, NOW()
      )
      ON CONFLICT (id_mensagem) DO NOTHING
      RETURNING *;
    `;

    const values = [
      msg.id || null,
      msg.CONSTRUCTOR_ID || null,
      msg.SUBCLASS_OF_ID || null,
      msg.className || null,
      msg.classType || null,
      msg.fromId?.userId || null,  // ✅ corrigido
      msg.peerId?.userId || null,  // ✅ corrigido
      msg.out || false,
      msg.mentioned || false,
      msg.mediaUnread || false,
      msg.silent || false,
      msg.ttlPeriod || null,
      msg.date ? new Date(msg.date * 1000) : null,  // ✅ corrigido
      msg.message || null,
      msg.fwdFrom ? JSON.stringify(msg.fwdFrom) : null,
      msg.viaBotId || null,
      msg.replyTo ? JSON.stringify(msg.replyTo) : null,
      msg.media ? JSON.stringify(msg.media) : null,
      msg.entities ? JSON.stringify(msg.entities) : null,
      msg.views || null,
      msg.forwards || null,
      msg.replies ? JSON.stringify(msg.replies) : null,
      msg.editDate ? new Date(msg.editDate * 1000) : null,  // ✅ idem
      msg.pinned || false,
      msg.groupedId || null,
      msg.restrictionReason ? JSON.stringify(msg.restrictionReason) : null,
      msg.noforwards || false
    ];

    try {
      const result = await pool.query(q, values);

      if (result.rows[0]) {
        logger.info(`Mensagem Telegram salva: id=${result.rows[0].id_mensagem}`);
      } else {
        logger.warn(`Mensagem Telegram duplicada (não inserida): ${msg.id}`);
      }

      return result.rows[0];
    } catch (err) {
      logger.error(`Erro ao salvar mensagem Telegram: ${err.message}`, { stack: err.stack });
      throw err;
    }
  }
};

module.exports = TelegramMessageModel;
