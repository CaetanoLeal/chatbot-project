// src/repositories/funilExpiracao.repository.js
const db = require('../config/db')

class FunilExpiracaoRepository {
  async listar(id_funil) {
    const { rows } = await db.query(
      `
      SELECT
        id_funil_expiracao,
        id_funil,
        gn_mensagem,
        nu_sequencia,
        qt_minutos
      FROM tbl_funil_expiracao
      WHERE id_funil = $1 AND is_excluido = false
      ORDER BY nu_sequencia
      `,
      [id_funil]
    )
    return rows
  }

  async criar({ id_funil, gn_mensagem, nu_sequencia, qt_minutos }) {
    const { rows } = await db.query(
      `
      INSERT INTO tbl_funil_expiracao (id_funil, gn_mensagem, nu_sequencia, qt_minutos)
      VALUES ($1, $2, $3, $4)
      RETURNING id_funil_expiracao, id_funil, gn_mensagem, nu_sequencia, qt_minutos
      `,
      [id_funil, gn_mensagem, nu_sequencia, qt_minutos]
    )
    return rows[0]
  }

  async atualizar(id_funil, id_funil_expiracao, { gn_mensagem, nu_sequencia, qt_minutos }) {
    const { rows } = await db.query(
      `
      UPDATE tbl_funil_expiracao
      SET gn_mensagem = $1, nu_sequencia = $2, qt_minutos = $3, dh_alteracao = now()
      WHERE id_funil_expiracao = $4 AND id_funil = $5 AND is_excluido = false
      RETURNING id_funil_expiracao, id_funil, gn_mensagem, nu_sequencia, qt_minutos
      `,
      [gn_mensagem, nu_sequencia, qt_minutos, id_funil_expiracao, id_funil]
    )
    return rows[0] || null
  }

  async remover(id_funil, id_funil_expiracao) {
    const { rowCount } = await db.query(
      `
      UPDATE tbl_funil_expiracao
      SET is_excluido = true, dh_exclusao = now()
      WHERE id_funil_expiracao = $1 AND id_funil = $2 AND is_excluido = false
      `,
      [id_funil_expiracao, id_funil]
    )
    return rowCount > 0
  }

  // usado pelo FunilRepository.deletar() ao apagar o funil inteiro
  async removerPorFunil(client, id_funil) {
    await client.query(`DELETE FROM tbl_funil_expiracao WHERE id_funil = $1`, [id_funil])
  }
}

module.exports = new FunilExpiracaoRepository()