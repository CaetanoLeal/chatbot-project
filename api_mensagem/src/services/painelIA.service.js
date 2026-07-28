const repository = require("../repositories/painelIa.repository");

class PainelIAService {
  constructor() {
    this.apiKey = process.env.OPENAI_ADMIN_API_KEY || process.env.OPENAI_API_KEY;
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
      throw new Error(`Erro na API da OpenAI (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  async getUsageCompletions(params) {
    return await this.#fetchOpenAI("/organization/usage/completions", params);
  }

  async getUsage(startTime, endTime, bucketWidth = "1d", groupBy = null) {
    const params = {
      start_time: startTime,
      end_time: endTime,
      bucket_width: bucketWidth,
    };

    if (groupBy) {
      params.group_by = groupBy;
    }

    return await this.getUsageCompletions(params);
  }

  async getCosts(startTime, endTime, bucketWidth = "1d", groupBy = null) {
    const params = {
      start_time: startTime,
      end_time: endTime,
      bucket_width: bucketWidth,
    };

    if (groupBy) {
      params.group_by = groupBy;
    }

    return await this.#fetchOpenAI("/organization/costs", params);
  }

  // Recebe 'start' e 'end' vindos do Controller (ex: "2026-06-01")
  async getDashboardData(start, end) {
    const startTimeUnix = Math.floor(new Date(start).getTime() / 1000);
    // Adiciona 1 dia ou ajusta o horário para o fim do dia (23:59:59) se preferir abranger todo o último dia
    const endTimeUnix = Math.floor(new Date(end + "T23:59:59").getTime() / 1000);

    const [usageData, costData, modelCostData, detalhesAgentes, totaisBanco] = await Promise.all([
      this.getUsage(startTimeUnix, endTimeUnix, "1d"),
      this.getCosts(startTimeUnix, endTimeUnix, "1d"),
      this.getUsage(startTimeUnix, endTimeUnix, "1d", "model"),
      repository.obterResumoConsumo(),
      repository.obterTotaisGerais()
    ]);

    const totais = {
      total_prompt: totaisBanco?.total_prompt || 0,
      total_completion: totaisBanco?.total_completion || 0,
      total_geral: totaisBanco?.total_geral || 0
    };

    const evolucaoTokens = usageData.data?.map(item => ({
      data: new Date(item.start_time * 1000).toISOString().split('T')[0],
      prompt: item.input_tokens || 0,
      completion: item.output_tokens || 0
    })) || [];

    const evolucaoCustos = costData.data?.map(item => ({
      data: new Date(item.start_time * 1000).toISOString().split('T')[0],
      custo: item.amount?.value || 0
    })) || [];

    const custosPorModelo = modelCostData.data?.map((item, index) => ({
      id: `${item.model || "Outros"}-${index}`,
      modelo: item.model || "Outros",
      custo: (item.input_tokens || 0) * 0.000001 + (item.output_tokens || 0) * 0.000002
    })) || [];

    return {
      totais,
      evolucaoTokens,
      evolucaoCustos,
      custosPorModelo,
      detalhesAgentes
    };
  }
}

module.exports = new PainelIAService();