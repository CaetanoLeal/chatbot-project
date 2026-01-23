//MessageModel.js
const db = require("../config/db");

class MessageModel {
  /**
   * Salva qualquer mensagem WhatsApp (entrada ou saída)
   * @param {Object} msg - mensagem completa do WhatsApp
   */
  static async saveMessage(msg) {
    if (!msg || !msg._data || !msg._data.id) {
      throw new Error("Mensagem inválida para persistência");
    }

    const wa = msg._data;

    const payload = {
      id_mensagem: wa.id._serialized || null,
      id_chat: wa.id.remote || null,
      id_interno: wa.id.id || null,
      serialized_id: wa.id._serialized || null,

      from_me: wa.id.fromMe === true,
      ack: wa.ack ?? null,

      body: wa.body || null,
      type: wa.type || null,

      remote: wa.id.remote || null,
      from_number: wa.from || null,
      to_number: wa.to || null,
      author: wa.author || null,

      notify_name: wa.notifyName || null,
      is_starred: wa.isStarred === true,

      timestamp: wa.t || null,
      client_received_ts: Date.now()
    };

    const query = `
      INSERT INTO tbl_mensagem_whatsapp (
        id_mensagem,
        id_chat,
        id_interno,
        serialized_id,
        from_me,
        ack,
        body,
        type,
        remote,
        from_number,
        to_number,
        author,
        notify_name,
        is_starred,
        timestamp,
        client_received_ts
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )
      RETURNING *
    `;

    const values = [
      payload.id_mensagem,
      payload.id_chat,
      payload.id_interno,
      payload.serialized_id,
      payload.from_me,
      payload.ack,
      payload.body,
      payload.type,
      payload.remote,
      payload.from_number,
      payload.to_number,
      payload.author,
      payload.notify_name,
      payload.is_starred,
      payload.timestamp,
      payload.client_received_ts
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async saveMessageFromBaileys(data) {
  const {
    from,
    body,
    instanceId,
    messageId,
    timestamp,
    raw
  } = data;

  const query = `
    INSERT INTO tbl_mensagem_whatsapp (
      id_mensagem,
      id_chat,
      body,
      type,
      remote,
      from_number,
      from_me,
      timestamp,
      client_received_ts
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9
    )
    RETURNING *
  `;

  const values = [
    messageId,
    from,
    body,
    raw?.message?.type || 'text',
    from,
    from,
    false,
    timestamp,
    Date.now()
  ];

  const result = await db.query(query, values);
  return result.rows[0];
}

}

module.exports = MessageModel;
