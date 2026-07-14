"use strict";

const repository = require("../repositories/diaSemana.repository");

class DiaSemanaService {

    async listar() {

        return await repository.listar();

    }

}

module.exports = new DiaSemanaService();