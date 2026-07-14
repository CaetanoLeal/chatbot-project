"use strict";

const DiaSemanaService = require("../services/diaSemana.service");

class DiaSemanaController {

    async listar(req, res) {

        try {

            const dias =
                await DiaSemanaService.listar();

            res.json(dias);

        }
        catch (error) {

            res.status(400).json({
                error: error.message
            });

        }

    }

}

module.exports = new DiaSemanaController();