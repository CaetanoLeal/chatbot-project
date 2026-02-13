const InstanceService = require("../services/instance.service")

class InstanceController {
  async index(req, res) {
    try {
      const instances = await InstanceService.listar()

      return res.json({
        success: true,
        data: instances || []
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = new InstanceController()