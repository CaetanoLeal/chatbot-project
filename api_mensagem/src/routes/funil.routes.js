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

router.delete('/setores/:idSetor', FunilController.removerSetor)
router.delete('/:id', FunilController.deletar)

router.get('/:id', FunilController.buscarPorId)
router.put('/:id', FunilController.atualizar)
router.put('/:id/estrutura', FunilController.salvarEstrutura)

// Campos personalizados (armazenamento dinâmico dos dados coletados)
router.put('/:id/campos/:idCampo', FunilController.atualizarCampo)
router.delete('/:id/campos/:idCampo', FunilController.removerCampo)

// Setores (destino de atendimento humano / IA por área)
router.get('/:id/setores', FunilController.listarSetores)
router.put('/:id/setores/:idSetor', FunilController.atualizarSetor)

// Mensagens de expiração (disparadas por inatividade do usuário)
router.get('/:id/expiracoes', FunilController.listarExpiracoes)
router.post('/:id/expiracoes', FunilController.criarExpiracao)
router.put('/:id/expiracoes/:idExpiracao', FunilController.atualizarExpiracao)
router.delete('/:id/expiracoes/:idExpiracao', FunilController.removerExpiracao)

module.exports = router