//src/services/painelIA.service.js
const repository = require("../repositories/painelIa.repository");

// ============================================================================
// MAPA MODELO -> API_KEY_ID
// ============================================================================
const MODEL_API_KEY_ID = {
  "gpt-4o-mini": process.env.GPT_4O_MINI_SUBKEY,
  "gpt-4.1-mini": process.env.GPT_41_MINI_SUBKEY,
  "gpt-4o-mini-transcribe": process.env.GPT_4O_MINI_TRANSCRIBLE_SUBKEY,
};

// ============================================================================
// TABELA DE PREÇOS (USD) — mantenha atualizada manualmente
// Fonte: https://openai.com/api/pricing/
//
// Usada como FALLBACK: só entra em ação para modelos que ainda não têm
// uma key dedicada mapeada em MODEL_API_KEY_ID (ex: modelos novos, ou
// enquanto vários modelos ainda dividem a mesma key).
// ============================================================================
const MODEL_PRICING = {
  "gpt-4o": { unit: "token", input: 2.50, output: 10.00 },
  "gpt-4o-mini": { unit: "token", input: 0.15, output: 0.60 },
  "gpt-4.1": { unit: "token", input: 2.00, output: 8.00 },
  "gpt-4.1-mini": { unit: "token", input: 0.40, output: 1.60 },
  "gpt-4.1-nano": { unit: "token", input: 0.10, output: 0.40 },
  "o3": { unit: "token", input: 2.00, output: 8.00 },
  "o4-mini": { unit: "token", input: 1.10, output: 4.40 },
  "whisper-1": { unit: "second", perMinute: 0.006 },
  "gpt-4o-transcribe": { unit: "second", perMinute: 0.006 },
  "gpt-4o-mini-transcribe": { unit: "second", perMinute: 0.003 },
  "text-embedding-3-small": { unit: "token", input: 0.02, output: 0 },
  "text-embedding-3-large": { unit: "token", input: 0.13, output: 0 },
};

const TOKENS_PER_UNIT = 1_000_000;

const MODALITIES = [
  { key: "completions", path: "/organization/usage/completions", suportaGroupByModel: true },
  { key: "embeddings", path: "/organization/usage/embeddings", suportaGroupByModel: true },
  { key: "images", path: "/organization/usage/images", suportaGroupByModel: true },
  { key: "audio_speeches", path: "/organization/usage/audio_speeches", suportaGroupByModel: true },
  { key: "audio_transcriptions", path: "/organization/usage/audio_transcriptions", suportaGroupByModel: true },
  { key: "moderations", path: "/organization/usage/moderations", suportaGroupByModel: true },
  { key: "vector_stores", path: "/organization/usage/vector_stores", suportaGroupByModel: false },
  { key: "code_interpreter_sessions", path: "/organization/usage/code_interpreter_sessions", suportaGroupByModel: false },
];

const MODALIDADES_BASEADAS_EM_TOKEN = ["completions", "embeddings", "moderations"];

function estimarCusto(modelo, metrica) {
  const preco = MODEL_PRICING[modelo];
  if (!preco) return { valor: 0, conhecido: false };

  if (preco.unit === "token") {
    const custoInput = ((metrica.inputTokens || 0) / TOKENS_PER_UNIT) * preco.input;
    const custoOutput = ((metrica.outputTokens || 0) / TOKENS_PER_UNIT) * (preco.output || 0);
    return { valor: custoInput + custoOutput, conhecido: true };
  }

  if (preco.unit === "second") {
    const minutos = (metrica.seconds || 0) / 60;
    return { valor: minutos * preco.perMinute, conhecido: true };
  }

  return { valor: 0, conhecido: false };
}

function normalizarResultado(modalidade, result, dataStr) {
  const base = {
    modalidade,
    data: dataStr,
    modelo: result.model || "Não especificado",
    requests: result.num_model_requests ?? result.num_sessions ?? result.num_requests ?? 0,
    inputTokens: 0,
    outputTokens: 0,
    seconds: 0,
    unidadePrincipal: 0,
  };

  switch (modalidade) {
    case "completions":
    case "moderations":
      base.inputTokens = result.input_tokens || 0;
      base.outputTokens = result.output_tokens || 0;
      base.unidadePrincipal = base.inputTokens + base.outputTokens;
      return base;

    case "embeddings":
      base.inputTokens = result.input_tokens || 0;
      base.unidadePrincipal = base.inputTokens;
      return base;

    case "images":
      base.unidadePrincipal = result.images || 0;
      return base;

    case "audio_speeches":
      base.unidadePrincipal = result.characters || 0;
      return base;

    case "audio_transcriptions":
      base.seconds = result.seconds || 0;
      base.unidadePrincipal = base.seconds;
      return base;

    case "vector_stores":
      base.modelo = "N/A";
      base.unidadePrincipal = result.usage_bytes || 0;
      return base;

    case "code_interpreter_sessions":
      base.modelo = "N/A";
      base.requests = result.num_sessions || 0;
      base.unidadePrincipal = base.requests;
      return base;

    default:
      return base;
  }
}

class PainelIAService {
  constructor() {
    this.apiKey = process.env.OPENAI_ADMIN_API_KEY;
    this.baseUrl = "https://api.openai.com/v1";
  }

  async #fetchOpenAI(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API da OpenAI (${response.status}) em ${endpoint}: ${errorText}`);
    }

    return await response.json();
  }

  async #fetchAllPages(endpoint, params = {}) {
    let allData = [];
    let page = undefined;

    do {
      const requestParams = { ...params };
      if (page) requestParams.page = page;

      const json = await this.#fetchOpenAI(endpoint, requestParams);
      allData = allData.concat(json.data || []);
      page = json.has_more ? json.next_page : null;
    } while (page);

    return { data: allData };
  }

  async #getUsageByModality(modalidade, startTime, endTime) {
    const params = {
      start_time: startTime,
      end_time: endTime,
      bucket_width: "1d",
      limit: 31,
    };
    if (modalidade.suportaGroupByModel) params.group_by = "model";

    return await this.#fetchAllPages(modalidade.path, params);
  }

  async getCosts(startTime, endTime, groupBy = null) {
    const params = {
      start_time: startTime,
      end_time: endTime,
      bucket_width: "1d",
      limit: 180,
    };
    if (groupBy) params.group_by = groupBy;
    return await this.#fetchAllPages("/organization/costs", params);
  }

  async getDashboardData(start, end) {
    const startTimeUnix = Math.floor(new Date(start).getTime() / 1000);
    const endTimeUnix = Math.floor(new Date(end + "T23:59:59").getTime() / 1000);

    const resultadosModalidades = await Promise.allSettled(
      MODALITIES.map(m => this.#getUsageByModality(m, startTimeUnix, endTimeUnix))
    );

    let registros = [];
    MODALITIES.forEach((m, idx) => {
      const settled = resultadosModalidades[idx];
      if (settled.status !== "fulfilled") {
        console.error(`Falha ao buscar uso de "${m.key}":`, settled.reason?.message);
        return;
      }
      (settled.value.data || []).forEach(bucket => {
        const dataStr = new Date(bucket.start_time * 1000).toISOString().split('T')[0];
        (bucket.results || []).forEach(result => {
          registros.push(normalizarResultado(m.key, result, dataStr));
        });
      });
    });

    // Custos reais: total diário, por linha de produto E por api_key_id
    const [costData, costByLineItem, costByApiKey] = await Promise.all([
      this.getCosts(startTimeUnix, endTimeUnix),
      this.getCosts(startTimeUnix, endTimeUnix, "line_item"),
      this.getCosts(startTimeUnix, endTimeUnix, "api_key_id"),
    ]);

    const evolucaoCustos = (costData.data || []).map(item => ({
      data: new Date(item.start_time * 1000).toISOString().split('T')[0],
      custo: Number(item.results?.[0]?.amount?.value) || 0
    }));

    const custoPorLinhaMap = {};
    (costByLineItem.data || []).forEach(bucket => {
      (bucket.results || []).forEach(r => {
        const linha = r.line_item || "Outros";
        custoPorLinhaMap[linha] = (custoPorLinhaMap[linha] || 0) + (Number(r.amount?.value) || 0);
      });
    });
    const custoPorModalidade = Object.entries(custoPorLinhaMap)
      .map(([linha, custo]) => ({ linha, custo }))
      .sort((a, b) => b.custo - a.custo);

    // Custo real por api_key_id, no mesmo período — a peça nova
    const custoRealPorApiKeyId = {};
    (costByApiKey.data || []).forEach(bucket => {
      (bucket.results || []).forEach(r => {
        const keyId = r.api_key_id;
        if (!keyId) return;
        custoRealPorApiKeyId[keyId] = (custoRealPorApiKeyId[keyId] || 0) + (Number(r.amount?.value) || 0);
      });
    });

    // Inverso do mapa modelo->key, pra achar o modelo a partir do keyId
    const API_KEY_ID_TO_MODEL = Object.fromEntries(
      Object.entries(MODEL_API_KEY_ID).map(([modelo, keyId]) => [keyId, modelo])
    );

    const registrosTexto = registros.filter(r => MODALIDADES_BASEADAS_EM_TOKEN.includes(r.modalidade));
    const totais = {
      total_prompt: registrosTexto.reduce((acc, r) => acc + r.inputTokens, 0),
      total_completion: registrosTexto.reduce((acc, r) => acc + r.outputTokens, 0),
      total_geral: registrosTexto.reduce((acc, r) => acc + r.unidadePrincipal, 0),
    };

    const tokensPorDiaMap = {};
    registrosTexto.forEach(r => {
      if (!tokensPorDiaMap[r.data]) tokensPorDiaMap[r.data] = { prompt: 0, completion: 0 };
      tokensPorDiaMap[r.data].prompt += r.inputTokens;
      tokensPorDiaMap[r.data].completion += r.outputTokens;
    });
    const evolucaoTokens = Object.entries(tokensPorDiaMap).map(([data, v]) => ({ data, ...v }));

    const agregadoMap = {};
    registros.forEach(r => {
      const chave = `${r.modelo}__${r.modalidade}`;
      if (!agregadoMap[chave]) {
        agregadoMap[chave] = {
          modelo: r.modelo,
          modalidade: r.modalidade,
          requests: 0,
          inputTokens: 0,
          outputTokens: 0,
          seconds: 0,
          unidadePrincipal: 0,
        };
      }
      const acc = agregadoMap[chave];
      acc.requests += r.requests;
      acc.inputTokens += r.inputTokens;
      acc.outputTokens += r.outputTokens;
      acc.seconds += r.seconds;
      acc.unidadePrincipal += r.unidadePrincipal;
    });

    const custosPorModelo = Object.values(agregadoMap).map((item, index) => {
      const keyIdDoModelo = MODEL_API_KEY_ID[item.modelo];
      const custoRealDaKey = keyIdDoModelo ? custoRealPorApiKeyId[keyIdDoModelo] : undefined;

      // Se o modelo tem key dedicada mapeada e ela apareceu nos custos do
      // período, usa o valor REAL. Senão, cai pra estimativa por token/segundo.
      if (keyIdDoModelo && custoRealDaKey !== undefined) {
        return {
          id: `${item.modelo}-${item.modalidade}-${index}`,
          modelo: item.modelo,
          modalidade: item.modalidade,
          requests: item.requests,
          unidadePrincipal: item.unidadePrincipal,
          custo: Number(custoRealDaKey.toFixed(6)),
          custoEstimado: false, // valor real, vindo de /organization/costs
          precoConhecido: true,
        };
      }

      const { valor, conhecido } = estimarCusto(item.modelo, item);
      return {
        id: `${item.modelo}-${item.modalidade}-${index}`,
        modelo: item.modelo,
        modalidade: item.modalidade,
        requests: item.requests,
        unidadePrincipal: item.unidadePrincipal,
        custo: Number(valor.toFixed(6)),
        custoEstimado: true,
        precoConhecido: conhecido,
      };
    });

    const modeloMaisGasta = [...custosPorModelo].sort((a, b) => b.custo - a.custo)[0] || null;
    const modeloMaisUsado = [...custosPorModelo].sort((a, b) => b.requests - a.requests)[0] || null;

    const detalhesAgentes = await repository.obterResumoConsumo();

    return {
      totais,
      evolucaoTokens,
      evolucaoCustos,
      custosPorModelo,
      custoPorModalidade,
      modeloMaisGasta,
      modeloMaisUsado,
      detalhesAgentes,
    };
  }
}

module.exports = new PainelIAService();