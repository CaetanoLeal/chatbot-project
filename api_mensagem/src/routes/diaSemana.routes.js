//src/routes/diaSemana.routes.js
"use strict";

const { Router } = require("express");
const DiaSemanaController = require("../controllers/diaSemana.controller");

const router = Router();

router.get(
    "/",
    DiaSemanaController.listar
);

module.exports = router;