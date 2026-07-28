// src/services/iaService.js
"use strict"

const OpenAI = require("openai")
const crypto = require("crypto")
const db = require("../config/db")
const logger = require("../../logger")

require("dotenv").config()

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/* ============================================================
   GERA RESPOSTA DA IA (OpenAI Chat Completions)
   ------------------------------------------------------------
   id_funil_ia    -> NOVO: ID da IA para registrar o consumo na tbl_consumo_ia
   systemPrompt   -> ds_personalidade (tbl_funil_ia)
   historico      -> [{ role: "user"|"assistant", content }]
   mensagemAtual  -> texto que o utilizador acabou de mandar
   model          -> ds_funil_ia_modelo (tbl_funil_ia_modelo)
   temperature    -> nu_temperature (tbl_funil_ia)
   maxTokens      -> nu_max_tokens (tbl_funil_ia)
   ============================================================ */
async function gerarResposta({
  id_funil_ia, // <-- NOVO: Certifique-se de passar isso ao chamar a função no seu controller/webhook
  systemPrompt,
  historico = [],
  mensagemAtual,
  model,
  temperature,
  maxTokens,
}) {
  const messages = [
    { role: "system", content: systemPrompt || "Você é um assistente virtual amigável." },
    ...historico,
    { role: "user", content: mensagemAtual },
  ]

  try {
    const response = await client.chat.completions.create({
      model      : model || "gpt-4o-mini",
      messages,
      temperature: temperature ?? 0.7,
      max_tokens : maxTokens || 300,
    })

    const content = response.choices?.[0]?.message?.content?.trim() || null
    const usage = response.usage; // NOVO: Extrai o objeto de consumo

    // NOVO: Registro do consumo de forma assíncrona
    if (id_funil_ia && usage) {
      const modelUsed = model || "gpt-4o-mini";
      
      db.query(`
        INSERT INTO tbl_consumo_ia (
          id_consumo, id_funil_ia, ds_modelo, 
          qt_tokens_prompt, qt_tokens_completion, qt_tokens_total
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        crypto.randomUUID(),
        id_funil_ia,
        modelUsed,
        usage.prompt_tokens,
        usage.completion_tokens,
        usage.total_tokens
      ]).catch(err => {
        // Usa o seu logger para não travar a aplicação, caso falhe a inserção
        logger.error("❌ Erro ao registrar consumo de IA no banco:", err.message);
      });
    }

    // Mantemos o mesmo retorno para não quebrar outras partes do seu código
    return content

  } catch (err) {
    logger.error("❌ Erro ao chamar a API da OpenAI:", err.message)
    throw err
  }
}

module.exports = { gerarResposta }