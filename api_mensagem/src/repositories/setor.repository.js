"use strict";

const db = require("../config/db");
const crypto = require("crypto");

class SetorRepository {

  /* ======================================================
     SETORES
  ======================================================= */

  async listar(client = null) {
        const conn = client || db;

        const { rows } = await conn.query(`
            SELECT
                s.id_setor,
                s.no_setor,
                s.ds_setor,
                (
                    SELECT COUNT(*)
                    FROM tbl_setor_horario h
                    WHERE h.id_setor = s.id_setor
                    AND h.is_excluido = FALSE
                ) AS total_horarios
            FROM tbl_setor s
            WHERE s.is_excluido = FALSE
            ORDER BY s.no_setor
        `);

        return rows;
    }

  async listarCampos(id_funil, client = null) {
        const conn = client || db;

        const { rows } = await conn.query(`
            SELECT DISTINCT
                s.id_setor,
                s.no_setor,
                s.ds_setor
            FROM tbl_setor s
            INNER JOIN (
                SELECT id_setor
                FROM tbl_funil_cadastro
                WHERE id_funil = $1

                UNION

                SELECT id_setor
                FROM tbl_funil_chatbot
                WHERE id_funil = $1

                UNION

                SELECT id_setor
                FROM tbl_funil_ia
                WHERE id_funil = $1
            ) x
                ON x.id_setor = s.id_setor
            WHERE s.is_excluido = FALSE
            ORDER BY s.no_setor
        `,[id_funil]);

        return rows;
    }

  async buscarPorId(idSetor, client = null) {
        const conn = client || db;

        const { rows } = await conn.query(`
            SELECT
                id_setor,
                no_setor,
                ds_setor
            FROM tbl_setor
            WHERE id_setor=$1
            AND is_excluido=FALSE
        `,[idSetor]);

        if (!rows.length)
            return null;

        const setor = rows[0];

        setor.horarios = await this.listarHorarios(idSetor, conn);

        return setor;
    }

  async inserir(dados, client = null) {

        const conn = client || db;

        const id = crypto.randomUUID();

        const { rows } = await conn.query(`
            INSERT INTO tbl_setor
            (
                id_setor,
                no_setor,
                ds_setor,
                dh_inclusao,
                is_excluido
            )
            VALUES
            (
                $1,
                $2,
                $3,
                NOW(),
                FALSE
            )
            RETURNING *
        `,[
            id,
            dados.no_setor,
            dados.ds_setor ?? null
        ]);

        return rows[0];
    }

  async atualizar(idSetor,dados,client=null){

        const conn = client || db;

        const { rows } = await conn.query(`
            UPDATE tbl_setor
            SET
                no_setor=$2,
                ds_setor=$3,
                dh_alteracao=NOW()
            WHERE
                id_setor=$1
            AND
                is_excluido=FALSE
            RETURNING *
        `,[
            idSetor,
            dados.no_setor,
            dados.ds_setor ?? null
        ]);

        return rows[0];
    }

  async excluir(idSetor, client = null) {
    const conn = client || db;
    await conn.query(`UPDATE tbl_setor SET is_excluido = TRUE, dh_exclusao = NOW() WHERE id_setor = $1`, [idSetor]);
    await conn.query(`UPDATE tbl_setor_horario SET is_excluido = TRUE, dh_exclusao = NOW() WHERE id_setor = $1`, [idSetor]);
    return true;
  }

  /* ======================================================
     HORÁRIOS
  ======================================================= */

  async listarHorarios(idSetor, client = null) {
    const conn = client || db;
    const sql = `
        SELECT h.id_setor_horario, h.id_setor, h.nu_dia_semana, d.ds_dia_semana, d.sg_dia_semana, h.hr_inicial, h.hr_final
        FROM tbl_setor_horario h
        INNER JOIN tbl_dia_semana d ON d.nu_dia_semana = h.nu_dia_semana
        WHERE h.id_setor = $1 AND h.is_excluido = FALSE
        ORDER BY h.nu_dia_semana, h.hr_inicial
    `;
    const { rows } = await conn.query(sql, [idSetor]);
    return rows;
  }

  async inserirHorario(dados, client = null) {
    const conn = client || db;
    const id = crypto.randomUUID();
    const sql = `
        INSERT INTO tbl_setor_horario (id_setor_horario, id_setor, nu_dia_semana, hr_inicial, hr_final, dh_inclusao, is_excluido)
        VALUES ($1, $2, $3, $4, $5, NOW(), FALSE) RETURNING *
    `;
    const { rows } = await conn.query(sql, [id, dados.id_setor, dados.nu_dia_semana, dados.hr_inicial, dados.hr_final]);
    return rows[0];
  }

  async atualizarHorario(idHorario, dados, client = null) {
    const conn = client || db;
    const sql = `
        UPDATE tbl_setor_horario SET nu_dia_semana = $2, hr_inicial = $3, hr_final = $4, dh_alteracao = NOW()
        WHERE id_setor_horario = $1 AND is_excluido = FALSE RETURNING *
    `;
    const { rows } = await conn.query(sql, [idHorario, dados.nu_dia_semana, dados.hr_inicial, dados.hr_final]);
    return rows[0];
  }

  async excluirHorario(idHorario, client = null) {
    const conn = client || db;
    await conn.query(`UPDATE tbl_setor_horario SET is_excluido = TRUE, dh_exclusao = NOW() WHERE id_setor_horario = $1`, [idHorario]);
    return true;
  }

  async buscarConflitoHorario(idSetor, diaSemana, horaInicial, horaFinal, idHorario = null, client = null) {
    const conn = client || db;
    let sql = `
        SELECT id_setor_horario FROM tbl_setor_horario
        WHERE id_setor = $1 AND nu_dia_semana = $2 AND is_excluido = FALSE
        AND (hr_inicial < $4 AND hr_final > $3)
    `;
    const params = [idSetor, diaSemana, horaInicial, horaFinal];
    if (idHorario) {
        sql += ` AND id_setor_horario <> $5`;
        params.push(idHorario);
    }
    const { rows } = await conn.query(sql, params);
    return rows.length > 0;
  }
}

module.exports = new SetorRepository();