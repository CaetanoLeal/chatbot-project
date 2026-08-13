//src/repositories/InstanceRepository.js
const db = require('../config/db')

class InstanceRepository {
  async listar() {
    const query = `
      SELECT 
        i.id_instancia,
        i.no_instancia,
        i.nu_telefone,
        i.ds_webhook,
        i.ds_foto_perfil,
        i.ds_auth_path,
        p.ds_provider,
        s.ds_status,
        f.no_funil
      FROM tbl_instancia i
      LEFT JOIN tbl_provider p ON p.cd_provider = i.cd_provider
      LEFT JOIN tbl_status s ON s.cd_status = i.cd_status
      JOIN tbl_funil f ON f.id_funil = i.id_funil
      ORDER BY i.dt_created_at DESC
    `

    const { rows } = await db.query(query)

    return rows
  }
}

module.exports = new InstanceRepository()