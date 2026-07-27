//src/routes/atendente.routes.js
const express = require('express');
const router = express.Router();
const AtendenteController = require('../controllers/atendente.controller');

router.post('/', AtendenteController.criar);
router.get('/', AtendenteController.listar);
router.put('/:id', AtendenteController.atualizar);
router.delete("/:id", AtendenteController.excluir);

module.exports = router;