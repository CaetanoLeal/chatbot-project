const db = require("../config/db")

async function listChats() {
  const { rows } = await db.query(`
    SELECT 
      c.*,
      u.no_utilizador,
      u.nu_telefone,
      p.ds_provider
    FROM tbl_chat c
    LEFT JOIN tbl_utilizador u 
      ON u.id_utilizador = c.id_utilizador
    LEFT JOIN tbl_provider p
      ON p.cd_provider = c.cd_provider
    ORDER BY c.dh_ultima_mensagem DESC NULLS LAST
  `)

  return rows
}

async function getMessagesByChat(id_chat) {
  const { rows } = await db.query(
    `
    SELECT *
    FROM tbl_mensagem
    WHERE id_chat = $1
    ORDER BY dh_envio ASC
    `,
    [id_chat]
  )

  return rows
}

module.exports = {
  listChats,
  getMessagesByChat
}