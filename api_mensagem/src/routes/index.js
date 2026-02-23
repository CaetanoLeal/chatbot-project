//src/routes/index.js
const { Router } = require('express')
const funilRoutes = require('./funil.routes')
const instanceRoutes = require('./instance.routes')
const contactRoutes = require('./contact.routes')

const router = Router()

router.use('/funis', funilRoutes)
router.use('/instancias', instanceRoutes)
router.use('/contacts', contactRoutes)

module.exports = router