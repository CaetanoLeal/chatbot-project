//src/routes/funilIa.routes.js
const express = require("express");

const controller =
  require("../controllers/funilIAController");

const router = express.Router();

router.post("/", controller.create);

router.get("/", controller.findAll);

router.get("/:id", controller.findById);

router.put("/:id", controller.update);

router.delete("/:id", controller.remove);

module.exports = router;