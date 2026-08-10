// src/routes/contato.routes.js
"use strict"

const { Router } = require("express")
const ContatoController = require("../controllers/contato.controller")

const router = Router()

router.get("/", ContatoController.listar)

module.exports = router