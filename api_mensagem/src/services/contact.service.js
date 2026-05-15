// services/contact.service.js
const contactRepository = require('../repositories/contact.repository')

class ContactService {
  async getAllContacts() {
    const rows = await contactRepository.findAll()

    const contactsMap = {}

    rows.forEach(row => {
      if (!contactsMap[row.id_utilizador]) {
        contactsMap[row.id_utilizador] = {
          id: row.id_utilizador,
          nome: row.no_utilizador,
          telefone: row.nu_telefone,
          plataformas: [
            row.cd_whatsapp && "whatsapp",
            row.cd_telegram && "telegram"
          ].filter(Boolean),
          funis: []
        }
      }

      if (row.id_funil) {
        contactsMap[row.id_utilizador].funis.push({
          nome: row.no_funil,
          ultimoContato: row.dh_mensagem
        })
      }
    })

    return Object.values(contactsMap)
  }
}

module.exports = new ContactService()