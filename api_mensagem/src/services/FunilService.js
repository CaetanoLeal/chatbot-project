const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const DEFAULT_FUNIL_ID = "e1e4748f-aa5b-4981-8694-81dc5aabde9c";

class FunilService {
  static async getOrCreateUtilizador({ telegramId, whatsappId }) {
    const field = telegramId ? "cd_telegram" : "cd_whatsapp";
    const value = telegramId || whatsappId;

    const r = await db.query(
      `SELECT id_utilizador FROM tbl_utilizador WHERE ${field} = $1`,
      [value]
    );

    if (r.rows.length) return r.rows[0].id_utilizador;

    const id = uuidv4();
    await db.query(
      `INSERT INTO tbl_utilizador (id_utilizador, ${field}) VALUES ($1,$2)`,
      [id, value]
    );

    return id;
  }

  static async getOrCreateFunilUtilizador(id_utilizador) {
    const r = await db.query(
      `SELECT * FROM tbl_funil_utilizador
       WHERE id_utilizador = $1 AND id_funil = $2
       ORDER BY dh_mensagem DESC LIMIT 1`,
      [id_utilizador, DEFAULT_FUNIL_ID]
    );

    if (r.rows.length) return r.rows[0];

    const id = uuidv4();
    await db.query(
      `INSERT INTO tbl_funil_utilizador
       (id_funil_utilizador, id_funil, id_utilizador, cd_mensagem_cadastro, dh_mensagem)
       VALUES ($1,$2,$3,0,NOW())`,
      [id, DEFAULT_FUNIL_ID, id_utilizador]
    );

    return { id_funil_utilizador: id, cd_mensagem_cadastro: 0 };
  }

  static async getMensagem(cdMensagem) {
    const r = await db.query(
      `SELECT * FROM tbl_funil_cadastro
       WHERE id_funil = $1 AND cd_mensagem = $2 LIMIT 1`,
      [DEFAULT_FUNIL_ID, cdMensagem]
    );
    return r.rows[0];
  }
}

module.exports = FunilService;
