//src/repositories/contact.repository.js
const db = require('../config/db')

class ContactRepository {
  async findAll() {
    const query = `
      SELECT 
          u.id_utilizador,
          u.no_utilizador,
          u.nu_telefone,
          u.cd_whatsapp,
          u.cd_telegram,
          fu.id_funil,
          f.no_funil,
          fu.dh_mensagem
      FROM tbl_utilizador u
      LEFT JOIN tbl_funil_utilizador fu 
          ON fu.id_utilizador = u.id_utilizador
      LEFT JOIN tbl_funil f
          ON f.id_funil = fu.id_funil
      ORDER BY fu.dh_mensagem DESC
    `

    const { rows } = await db.query(query)
    return rows
  }
}

module.exports = new ContactRepository()