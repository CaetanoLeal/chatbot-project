const contactService = require('../services/contact.service')

class ContactController {
  async index(req, res) {
    try {
      const contacts = await contactService.getAllContacts()
      return res.json(contacts)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: "Erro ao buscar contatos" })
    }
  }
}

module.exports = new ContactController()