const { Router } = require("express")
const router = Router()
const dashboardController = require("../controllers/dashboardController")

router.get("/", dashboardController.getDashboard)

module.exports = router