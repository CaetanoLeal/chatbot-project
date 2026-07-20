const dashboardService = require("../services/dashboard.service")

// GET /api/dashboard?period=today|month|year
exports.getDashboard = async (req, res) => {
  try {
    const { period } = req.query
    const data = await dashboardService.getDashboardData(period)
    res.json(data)
  } catch (err) {
    console.error("Erro ao carregar dashboard:", err)
    res.status(500).json({ error: "Erro ao carregar dashboard" })
  }
}