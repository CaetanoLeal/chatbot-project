// src/repositories/painelIa.repository.js
const db = require("../config/db");

/**
 * A tbl_consumo_ia foi removida: tokens e custos agora vêm 100% da API da
 * OpenAI (ver painelIA.service.js). A OpenAI não sabe qual "agente/funil"
 * do seu sistema disparou cada chamada — isso só existia localmente, nessa
 * tabela.
 *
 * Por ora, essa função devolve lista vazia. Os gráficos "Custo por Agente"
 * e "Consumo por Agente (Tokens)" no dashboard ficam sem dado até que o
 * rastreio por agente seja reimplementado (ex: um project_id/api_key
 * dedicado por agente na OpenAI, ou uma tabela de log local mais enxuta).
 */
async function obterResumoConsumo() {
  return [];
}

module.exports = {
  obterResumoConsumo,
};