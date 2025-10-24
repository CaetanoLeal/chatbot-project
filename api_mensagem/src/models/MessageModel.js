// src/models/MessageModel.js
const pool = require("../config/db");
const logger = require("../../logger"); // sobe duas pastas: src/models -> src -> raiz

// ajuste o caminho conforme seu projeto

const MessageModel = {
  async saveMessage(msg) {
    const q = `
      INSERT INTO tbl_mensagem_whatsapp (
        id_mensagem, id_chat, id_utilizador,
        from_me, remote, id_interno, serialized_id,
        body, type, timestamp, client_received_ts,
        ack, from_number, to_number, author,
        notify_name, is_starred, created_at
      ) VALUES (
        COALESCE($1, uuid_generate_v4()), $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17, NOW()
      )
      ON CONFLICT (id_mensagem) DO NOTHING
      RETURNING *;
    `;


    const values = [
      msg._data?.id?._serialized || null,
      msg._data?.id?.remote || null,
      null,
      msg._data?.id?.fromMe || false,
      msg._data?.id?.remote || null,
      msg._data?.id?.id || null,
      msg._data?.id?._serialized || null,
      msg._data?.body || null,
      msg._data?.type || null,
      msg._data?.t || null,
      msg._data?.clientUrl || null,
      msg._data?.ack || null,
      msg._data?.from || null,
      msg._data?.to || null,
      msg._data?.author || null,
      msg._data?.notifyName || null,
      msg._data?.isStarred || false
    ];

    try {
      const result = await pool.query(q, values);

      // Log da mensagem salva
      if (result.rows[0]) {
        logger.info(`Mensagem salva no banco: id_mensagem=${result.rows[0].id_mensagem}`);
      } else {
        logger.warn(`Mensagem não foi inserida (possivelmente duplicada): ${msg._data?.id?._serialized}`);
      }

      return result.rows[0];
    } catch (err) {
      // Log do erro com stack trace
      logger.error(`Erro ao salvar mensagem: ${err.message}`, { stack: err.stack });
      throw err;
    }
  }
};

module.exports = MessageModel;