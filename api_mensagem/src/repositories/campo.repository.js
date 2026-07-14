// src/repositories/campo.repository.js

const { v4: uuid } = require("uuid");
const db = require("../config/db");

class CampoRepository {

  async listarPorFunil(id_funil) {
    const { rows } = await db.query(
      `
      SELECT DISTINCT
          C.id_campo,
          C.no_campo,
          C.cd_campo_tipo,
          CT.ds_campo_tipo,
          CT.gn_campo_erro,
          C.is_obrigatorio
      FROM tbl_campo C

      INNER JOIN tbl_campo_tipo CT
          ON CT.cd_campo_tipo = C.cd_campo_tipo

      WHERE C.id_campo IN (

            SELECT id_campo
            FROM tbl_funil_cadastro
            WHERE id_funil = $1
              AND id_campo IS NOT NULL

            UNION

            SELECT id_campo
            FROM tbl_funil_chatbot
            WHERE id_funil = $1
              AND id_campo IS NOT NULL
      )

      ORDER BY C.no_campo
      `,
      [id_funil]
    );

    return rows;
  }

  async buscarPorId(id_campo) {
    const { rows } = await db.query(
      `
      SELECT
          C.*,
          CT.ds_campo_tipo,
          CT.gn_campo_erro
      FROM tbl_campo C
      INNER JOIN tbl_campo_tipo CT
          ON CT.cd_campo_tipo = C.cd_campo_tipo
      WHERE C.id_campo = $1
      `,
      [id_campo]
    );

    return rows[0] || null;
  }

  async criar({
    no_campo,
    cd_campo_tipo,
    is_obrigatorio = true,
  }) {

    const id_campo = uuid();

    await db.query(
      `
      INSERT INTO tbl_campo
      (
          id_campo,
          no_campo,
          cd_campo_tipo,
          is_obrigatorio
      )
      VALUES
      (
          $1,
          $2,
          $3,
          $4
      )
      `,
      [
        id_campo,
        no_campo,
        cd_campo_tipo,
        is_obrigatorio,
      ]
    );

    return id_campo;
  }

  async atualizar(
    id_campo,
    {
      no_campo,
      cd_campo_tipo,
      is_obrigatorio,
    }
  ) {

    await db.query(
      `
      UPDATE tbl_campo
      SET
          no_campo = $2,
          cd_campo_tipo = $3,
          is_obrigatorio = $4
      WHERE id_campo = $1
      `,
      [
        id_campo,
        no_campo,
        cd_campo_tipo,
        is_obrigatorio,
      ]
    );
  }

  async remover(id_campo) {

    await db.query(
      `
      DELETE FROM tbl_campo
      WHERE id_campo = $1
      `,
      [id_campo]
    );
  }
}

module.exports = new CampoRepository();