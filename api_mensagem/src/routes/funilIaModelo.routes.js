//src/routes/funilIaModelo.routes.js
const express = require("express");

const controller =
  require("../controllers/funilIAModeloController");

const router = express.Router();

router.get("/", controller.findAll);

module.exports = router;