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

export type EvolucaoTokensItem = {
  data: string;
  prompt: number;
  completion: number;
}

export type EvolucaoCustoItem = {
  data: string;
  custo: number;
}

// Modalidades de uso suportadas pela integração com a API da OpenAI
export type ModalidadeUsoIA =
  | "completions"
  | "embeddings"
  | "images"
  | "audio_speeches"
  | "audio_transcriptions"
  | "moderations"
  | "vector_stores"
  | "code_interpreter_sessions";

// Item agregado por modelo + modalidade (retornado por getDashboardData)
export type CustoModeloItem = {
  id: string;
  modelo: string;
  modalidade: ModalidadeUsoIA;
  requests: number;
  unidadePrincipal: number; // tokens, segundos, imagens, bytes... depende da modalidade
  custo: number;            // estimativa em dólares, baseada em MODEL_PRICING
  custoEstimado: true;      // sempre true: nunca é o valor real cobrado
  precoConhecido: boolean;  // false = modelo não está na tabela de preços (custo ficou 0)
}

// Gasto real (não estimado) agrupado por linha de produto, via /organization/costs
export type CustoModalidadeItem = {
  linha: string;
  custo: number;
}

export type DashboardIAData = {
  totais: TotaisConsumoIA;
  detalhesAgentes: DetalheAgenteIA[];
  evolucaoTokens: EvolucaoTokensItem[];
  custosPorModelo: CustoModeloItem[];
  custoPorModalidade: CustoModalidadeItem[];
  modeloMaisGasta: CustoModeloItem | null;
  modeloMaisUsado: CustoModeloItem | null;
  evolucaoCustos: EvolucaoCustoItem[];
}