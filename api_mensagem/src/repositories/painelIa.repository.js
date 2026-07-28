const db = require("../config/db");

async function obterResumoConsumo() {
  const query = `
    SELECT 
      f.no_agente,
      c.ds_modelo,
      COUNT(c.id_consumo) as total_requisicoes,
      SUM(c.qt_tokens_total) as total_tokens,
      MAX(c.dh_inclusao) as ultima_utilizacao
    FROM tbl_consumo_ia c
    INNER JOIN tbl_funil_ia f ON c.id_funil_ia = f.id_funil_ia
    GROUP BY f.no_agente, c.ds_modelo
    ORDER BY total_tokens DESC;
  `;
  
  const result = await db.query(query);
  return result.rows;
}

async function obterTotaisGerais() {
  const query = `
    SELECT 
      SUM(qt_tokens_prompt) as total_prompt,
      SUM(qt_tokens_completion) as total_completion,
      SUM(qt_tokens_total) as total_geral
    FROM tbl_consumo_ia;
  `;
  const result = await db.query(query);
  return result.rows[0];
}

module.exports = {
  obterResumoConsumo,
  obterTotaisGerais
};