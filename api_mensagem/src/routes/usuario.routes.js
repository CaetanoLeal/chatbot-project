// src/routes/usuario.routes.js
const express = require("express");
const usuarioController = require("../controllers/usuario.controller");

const router = express.Router();

// Login
router.post("/login", usuarioController.login);

// Validação da sessão
router.get("/validate", usuarioController.validate);

// Logout
router.post("/logout", usuarioController.logout);

// Cadastro
router.post("/cadastrar", usuarioController.cadastrar);

module.exports = router;