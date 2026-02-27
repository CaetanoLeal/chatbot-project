const { Router } = require("express")
const ChatController = require("../controllers/ChatController")

const router = Router()

router.get("/", ChatController.list)
router.get("/:id_chat/messages", ChatController.messages)

module.exports = router