//src/routes/funil.routes.js
const { Router } = require('express')
const FunilController = require('../controllers/funil.controller')

const router = Router()

router.get('/', FunilController.listar)
router.post('/', FunilController.criar)
router.put('/:id/estrutura', FunilController.salvarEstrutura)

module.exports = router