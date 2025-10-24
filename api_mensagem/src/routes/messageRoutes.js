//src/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db.js");

// webhook que recebe a mensagem
router.post("/", async (req, res) => {
  try {
    const message = req.body;

    // Extrai os dados importantes
    const {
      id,
      body,
      type,
      timestamp,
      from,
      to,
      author,
      ack,
      hasMedia,
      deviceType,
      fromMe,
      quotedMsg,
      notifyName,
    } = message;

    // Monta insert
    const query = `
      INSERT INTO tbl_mensagem_whatsapp (
        id_mensagem, id_chat, from_me, remote, id_interno, serialized_id,
        body, type, timestamp, ack,
        from_number, to_number, author, notify_name,
        has_media, device_type, has_quoted_msg, quoted_msg_id, quoted_msg_body
      ) VALUES (
        gen_random_uuid(), NULL, $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16, $17
      )
    `;

    const values = [
      fromMe || false,
      id?.remote || null,
      id?.id || null,
      id?._serialized || null,
      body || null,
      type || null,
      timestamp || null,
      ack || null,
      from || null,
      to || null,
      author || null,
      notifyName || null,
      hasMedia || false,
      deviceType || null,
      quotedMsg ? true : false,
      quotedMsg?.stanzaID || null,
      quotedMsg?.body || null,
    ];

    await pool.query(query, values);

    res.status(201).json({ success: true, message: "Mensagem salva com sucesso" });
  } catch (err) {
    console.error("Erro ao salvar mensagem:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
