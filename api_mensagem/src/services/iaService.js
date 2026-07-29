// src/services/iaService.js
"use strict"

const OpenAI = require("openai")
const logger = require("../../logger")

require("dotenv").config()

const MODEL_API_KEY_ENV = {
  "gpt-4o-mini": "GPT_4O_MINI_KEY",
  "gpt-4.1-mini": "GPT_41_MINI_KEY",
}

// Cache de clientes OpenAI por modelo, pra não instanciar um client novo
// a cada chamada de gerarResposta.
const clientesPorModelo = new Map()

function getClientParaModelo(model) {
  const nomeVarAmbiente = MODEL_API_KEY_ENV[model]

  if (!nomeVarAmbiente) {
    throw new Error(
      `Nenhuma API key mapeada para o modelo "${model}". ` +
      `Adicione a entrada correspondente em MODEL_API_KEY_ENV (iaService.js).`
    )
  }

  const apiKey = process.env[nomeVarAmbiente]

  if (!apiKey) {
    throw new Error(
      `Variável de ambiente "${nomeVarAmbiente}" não está definida (necessária para o modelo "${model}").`
    )
  }

  if (!clientesPorModelo.has(model)) {
    clientesPorModelo.set(model, new OpenAI({ apiKey }))
  }

  return clientesPorModelo.get(model)
}

/* ============================================================
   GERA RESPOSTA DA IA (OpenAI Chat Completions)
   ------------------------------------------------------------
   systemPrompt   -> ds_personalidade (tbl_funil_ia)
   historico      -> [{ role: "user"|"assistant", content }]
   mensagemAtual  -> texto que o utilizador acabou de mandar
   model          -> ds_funil_ia_modelo (tbl_funil_ia_modelo)
   temperature    -> nu_temperature (tbl_funil_ia)
   maxTokens      -> nu_max_tokens (tbl_funil_ia)

   A chave de API usada é escolhida com base no `model`, via
   MODEL_API_KEY_ENV, permitindo separar o consumo de cada modelo
   na análise de custos da OpenAI (Admin API / painel de organização).
   ============================================================ */
async function gerarResposta({
  systemPrompt,
  historico = [],
  mensagemAtual,
  model,
  temperature,
  maxTokens,
}) {
  const modeloUsado = model || "gpt-4o-mini"

  const messages = [
    { role: "system", content: systemPrompt || "Você é um assistente virtual amigável." },
    ...historico,
    { role: "user", content: mensagemAtual },
  ]

  const client = getClientParaModelo(modeloUsado)

  try {
    const response = await client.chat.completions.create({
      model      : modeloUsado,
      messages,
      temperature: temperature ?? 0.7,
      max_tokens : maxTokens || 300,
    })

    return response.choices?.[0]?.message?.content?.trim() || null

  } catch (err) {
    logger.error(`❌ Erro ao chamar a API da OpenAI (modelo: ${modeloUsado}):`, err.message)
    throw err
  }
}

module.exports = { gerarResposta }