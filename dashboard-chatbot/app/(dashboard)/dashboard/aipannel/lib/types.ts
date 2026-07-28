// lib/types.ts

export type TotaisConsumoIA = {
  total_prompt: number | null;
  total_completion: number | null;
  total_geral: number | null;
}

export type DetalheAgenteIA = {
  no_agente: string;
  ds_modelo: string;
  total_requisicoes: number;
  total_tokens: number;
}

export type DashboardIAData = {
  totais: TotaisConsumoIA;
  detalhesAgentes: DetalheAgenteIA[];
  evolucaoTokens: EvolucaoTokensItem[];
  custosPorModelo: CustoModeloItem[];
  evolucaoCustos: EvolucaoCustoItem[];
}

export type EvolucaoTokensItem = {
  data: string;
  prompt: number;
  completion: number;
}

export type CustoModeloItem = {
  modelo: string;
  custo: number; // Valor em Dólares ou Reais
}

export type EvolucaoCustoItem = {
  data: string;
  custo: number;
}