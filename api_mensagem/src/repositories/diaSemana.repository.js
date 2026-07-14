"use strict";

const db = require("../config/db");

class DiaSemanaRepository {

    async listar() {

        const sql = `
            SELECT
                nu_dia_semana,
                ds_dia_semana,
                sg_dia_semana
            FROM tbl_dia_semana
            ORDER BY nu_dia_semana
        `;

        const { rows } = await db.query(sql);

        return rows;

    }

}

module.exports = new DiaSemanaRepository();