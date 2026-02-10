//src/routes/index.js
const { Router } = require('express')
const funilRoutes = require('./funil.routes')

const router = Router()

router.use('/funis', funilRoutes)

module.exports = router