//src/routes/chat.routes.js
const { Router } = require('express')
const contactController = require('../controllers/contact.controller')

const router = Router()

router.get('/', contactController.index)

module.exports = router