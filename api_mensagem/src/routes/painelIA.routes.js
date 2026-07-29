//src/routes/painelIA.routes.js
const express = require("express");
const controller = require("../controllers/painelIa.controller");
const router = express.Router();

router.get("/", controller.getDashboardData);

module.exports = router;