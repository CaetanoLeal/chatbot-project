const { Router } = require('express')
const funilRoutes = require('./funil.routes')
const instanceRoutes = require('./instance.routes')
const contactRoutes = require('./contact.routes')
const chatRoutes = require("./chat.routes")
const dashboardRoutes = require("./dashboard.routes")

const router = Router()

router.use('/funis', funilRoutes)
router.use('/instancias', instanceRoutes)
router.use('/contacts', contactRoutes)
router.use("/chats", chatRoutes)
router.use("/dashboard", dashboardRoutes)

module.exports = router