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
        s.ds_status
      FROM tbl_instancia i
      LEFT JOIN tbl_provider p ON p.cd_provider = i.cd_provider
      LEFT JOIN tbl_status s ON s.cd_status = i.cd_status
      ORDER BY i.dt_created_at DESC
    `

    const { rows } = await db.query(query)

    return rows
  }
}

module.exports = new InstanceRepository()