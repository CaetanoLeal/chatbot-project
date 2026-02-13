//src/routes/index.js
const { Router } = require('express')
const funilRoutes = require('./funil.routes')
const instanceRoutes = require('./instance.routes')

const router = Router()

router.use('/funis', funilRoutes)
router.use('/instancias', instanceRoutes)

module.exports = router