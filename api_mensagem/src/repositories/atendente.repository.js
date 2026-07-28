//src/repositories/atendente.repository.js
const db = require("../config/db");

class AtendenteRepository {
  async verificarIaNoSetor(id_setor) {
    const query = `
      SELECT a.id_atendente
      FROM tbl_atendente a
      INNER JOIN tbl_atendente_setor ats
        ON ats.id_atendente = a.id_atendente
       AND (ats.is_excluido = false OR ats.is_excluido IS NULL)
      WHERE ats.id_setor = $1
        AND a.is_ia = true
        AND (a.is_excluido = false OR a.is_excluido IS NULL)
      LIMIT 1;
    `;

    const { rows } = await db.query(query, [id_setor]);
    return rows.length > 0;
  }

  async criar(dados) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `
        INSERT INTO tbl_atendente (
          no_atendente,
          im_image,
          is_ia
        )
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [
          dados.no_atendente,
          dados.im_image,
          dados.is_ia,
        ]
      );

      const atendente = rows[0];

      if (Array.isArray(dados.id_setor) && dados.id_setor.length > 0) {
        for (const idSetor of dados.id_setor) {
          await client.query(
            `
            INSERT INTO tbl_atendente_setor (
              id_atendente,
              id_setor
            )
            VALUES ($1, $2);
            `,
            [atendente.id_atendente, idSetor]
          );
        }
      }

      await client.query("COMMIT");

      return atendente;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async listarTodos() {
    const query = `
      SELECT
        a.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id_setor', s.id_setor,
              'no_setor', s.no_setor
            )
            ORDER BY s.no_setor
          ) FILTER (WHERE s.id_setor IS NOT NULL),
          '[]'
        ) AS setores
      FROM tbl_atendente a

      LEFT JOIN tbl_atendente_setor ats
        ON ats.id_atendente = a.id_atendente
       AND (ats.is_excluido = false OR ats.is_excluido IS NULL)

      LEFT JOIN tbl_setor s
        ON s.id_setor = ats.id_setor
       AND (s.is_excluido = false OR s.is_excluido IS NULL)

      WHERE a.is_excluido = false OR a.is_excluido IS NULL

      GROUP BY a.id_atendente

      ORDER BY a.dh_inclusao DESC;
    `;

    const { rows } = await db.query(query);
    return rows;
  }

  async atualizar(id, dados) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `
        UPDATE tbl_atendente
        SET
          no_atendente = $1,
          im_image = $2,
          is_ia = $3,
          dh_alteracao = NOW()
        WHERE id_atendente = $4
        RETURNING *;
        `,
        [
          dados.no_atendente,
          dados.im_image,
          dados.is_ia,
          id,
        ]
      );

      await client.query(
        `
        UPDATE tbl_atendente_setor
        SET
          is_excluido = true,
          dh_exclusao = NOW(),
          dh_alteracao = NOW()
        WHERE id_atendente = $1;
        `,
        [id]
      );

      if (Array.isArray(dados.id_setor) && dados.id_setor.length > 0) {
        for (const idSetor of dados.id_setor) {
          await client.query(
            `
            INSERT INTO tbl_atendente_setor (
              id_atendente,
              id_setor
            )
            VALUES ($1, $2);
            `,
            [id, idSetor]
          );
        }
      }

      await client.query("COMMIT");

      return rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async excluir(id) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE tbl_atendente_setor
        SET
          is_excluido = true,
          dh_exclusao = NOW(),
          dh_alteracao = NOW()
        WHERE id_atendente = $1;
        `,
        [id]
      );

      const { rowCount } = await client.query(
        `
        UPDATE tbl_atendente
        SET
          is_excluido = true,
          dh_exclusao = NOW(),
          dh_alteracao = NOW()
        WHERE id_atendente = $1
        RETURNING id_atendente;
        `,
        [id]
      );

      await client.query("COMMIT");

      return rowCount > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /* ============================================================
     NOVO — usado pelo painel de atendimento (chatService).
     Busca um atendente único, com o mesmo filtro de excluído
     usado no resto do repository.
     ============================================================ */
  async buscarPorId(id_atendente) {
    const query = `
      SELECT *
      FROM tbl_atendente
      WHERE id_atendente = $1
        AND (is_excluido = false OR is_excluido IS NULL)
      LIMIT 1;
    `;

    const { rows } = await db.query(query, [id_atendente]);
    return rows[0] || null;
  }

  /* ============================================================
     NOVO — usado pelo painel de atendimento (chatService) para
     validar, antes de enviar uma mensagem, se o atendente
     selecionado está mesmo habilitado a atender o setor atual
     do chat (via tbl_atendente_setor).
     ============================================================ */
  async verificarCapacitacaoSetor(id_atendente, id_setor) {
    const query = `
      SELECT 1
      FROM tbl_atendente_setor
      WHERE id_atendente = $1
        AND id_setor = $2
        AND (is_excluido = false OR is_excluido IS NULL)
      LIMIT 1;
    `;

    const { rows } = await db.query(query, [id_atendente, id_setor]);
    return rows.length > 0;
  }
}

module.exports = new AtendenteRepository();