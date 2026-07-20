//src/routes/dashboard.routes.js
const { Router } = require("express")
const router = Router()
const dashboardController = require("../controllers/dashboardController")

// GET /api/dashboard?period=today|month|year  (default: month)
router.get("/", dashboardController.getDashboard)

module.exports = router