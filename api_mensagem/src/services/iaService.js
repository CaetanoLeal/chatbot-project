// src/services/iaService.js
"use strict"

const OpenAI = require("openai")
const logger = require("../../logger")

require("dotenv").config()

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/* ============================================================
   GERA RESPOSTA DA IA (OpenAI Chat Completions)
   ------------------------------------------------------------
   systemPrompt   -> ds_personalidade (tbl_funil_ia)
   historico      -> [{ role: "user"|"assistant", content }]
   mensagemAtual  -> texto que o utilizador acabou de mandar
   model          -> ds_funil_ia_modelo (tbl_funil_ia_modelo)
   temperature    -> nu_temperature (tbl_funil_ia)
   maxTokens      -> nu_max_tokens (tbl_funil_ia)
   ============================================================ */
async function gerarResposta({
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

    return response.choices?.[0]?.message?.content?.trim() || null

  } catch (err) {
    logger.error("❌ Erro ao chamar a API da OpenAI:", err.message)
    throw err
  }
}

module.exports = { gerarResposta }