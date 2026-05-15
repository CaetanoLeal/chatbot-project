// services/instance.service.js
const InstanceRepository = require("../repositories/InstanceRepository")

class InstanceService {
  async listar() {
    const instances = await InstanceRepository.listar()

    return instances.map((item) => ({
      id: item.id_instancia,
      name: item.no_instancia,
      number: item.nu_telefone,
      platform: item.ds_provider,
      status: item.ds_status,
      webhook: item.ds_webhook,
      fotoPerfil: item.ds_foto_perfil,
      authPath: item.ds_auth_path
    }))
  }
}

module.exports = new InstanceService()