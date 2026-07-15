// src/routes/funil.routes.js
const { Router } = require('express')
const FunilController = require('../controllers/funil.controller')

const router = Router()

router.get('/campos/tipos', FunilController.listarTiposCampo)
router.get('/campos', FunilController.listarCampos)
router.post('/campos', FunilController.criarCampo)
router.post('/setores', FunilController.criarSetor)

router.get('/', FunilController.listar)
router.post('/', FunilController.criar)

router.get('/:id', FunilController.buscarPorId)
router.put('/:id/estrutura', FunilController.salvarEstrutura)

// Campos personalizados (armazenamento dinâmico dos dados coletados)
router.put('/:id/campos/:idCampo', FunilController.atualizarCampo)
router.delete('/:id/campos/:idCampo', FunilController.removerCampo)

// Setores (destino de atendimento humano / IA por área)
router.get('/:id/setores', FunilController.listarSetores)
router.put('/:id/setores/:idSetor', FunilController.atualizarSetor)
router.delete('/:id/setores/:idSetor', FunilController.removerSetor)

module.exports = router