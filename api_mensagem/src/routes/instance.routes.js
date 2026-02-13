//src/routes/instance.routes.js
const express = require("express")
const router = express.Router()
const InstanceController = require("../controllers/Instance.controller")

router.get("/", InstanceController.index)

module.exports = router