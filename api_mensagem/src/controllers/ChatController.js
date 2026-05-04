// controllers/ChatController.js
const chatService = require("../services/chatService")

async function list(req, res) {
  try {
    const chats = await chatService.listChats()

    return res.json({
      success: true,
      data: chats
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

async function messages(req, res) {
  try {
    const { id_chat } = req.params

    const msgs = await chatService.getMessagesByChat(id_chat)

    return res.json({
      success: true,
      data: msgs
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  list,
  messages
}