const painelIAService = require("../services/painelIA.service");

async function getDashboardData(req, res) {
  try {
    const { start, end } = req.query;
    
    // Fallback caso não venha parâmetro (últimos 30 dias)
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = end || new Date().toISOString().split('T')[0];

    const dashboardData = await painelIAService.getDashboardData(startDate, endDate);

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Erro ao carregar dados do Painel IA" });
  }
}

module.exports = { getDashboardData };