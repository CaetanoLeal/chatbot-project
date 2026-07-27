//src/repositories/atendente.repository.js
const db = require('../config/db');

class AtendenteRepository {
  async verificarIaNoSetor(id_setor) {
    const query = `
      SELECT id_atendente 
      FROM tbl_atendente 
      WHERE id_setor = $1 
        AND is_ia = true 
        AND (is_excluido = false OR is_excluido IS NULL)
    `;
    const { rows } = await db.query(query, [id_setor]);
    return rows.length > 0;
  }

  async criar(dados) {
    const query = `
      INSERT INTO tbl_atendente (
        id_setor, no_atendente, im_image, is_ia
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING *;
    `;
    
    const values = [
      dados.id_setor, 
      dados.no_atendente, 
      dados.im_image, 
      dados.is_ia
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async listarTodos() {
    const query = `
      SELECT a.*, s.no_setor 
      FROM tbl_atendente a
      LEFT JOIN tbl_setor s ON a.id_setor = s.id_setor
      WHERE a.is_excluido = false OR a.is_excluido IS NULL
      ORDER BY a.dh_inclusao DESC;
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  async atualizar(id, dados) {
    const query = `
      UPDATE tbl_atendente 
      SET id_setor = $1, no_atendente = $2, im_image = $3, is_ia = $4, dh_alteracao = NOW()
      WHERE id_atendente = $5
      RETURNING *;
    `;
    const values = [dados.id_setor, dados.no_atendente, dados.im_image, dados.is_ia, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async excluir(id) {
    const query = `
      UPDATE tbl_atendente 
      SET is_excluido = true, dh_alteracao = NOW()
      WHERE id_atendente = $1
      RETURNING id_atendente;
    `;
    
    const { rowCount } = await db.query(query, [id]);
    
    return rowCount > 0;
  }
}

module.exports = new AtendenteRepository();