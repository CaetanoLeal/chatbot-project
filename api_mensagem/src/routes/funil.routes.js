const { Router } = require('express')
const FunilController = require('../controllers/funil.controller')

const router = Router()

router.get('/', FunilController.listar)
router.post('/', FunilController.criar)

module.exports = router