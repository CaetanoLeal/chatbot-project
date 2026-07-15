// app/(dashboard)/dashboard/funnels/lib/api.ts
const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/funis`
const BASE2 = `${process.env.NEXT_PUBLIC_API_URL}/api`

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `Erro ${res.status}`)
  }
  return data as T
}

/* ===================== TIPOS ===================== */

export type Botao = {
  id?: string
  cd_botao: number
  ds_botao: string
  cd_mensagem_destino: number | null
}

export type Mensagem = {
  id?: string
  cd_mensagem: number
  ds_mensagem: string
  cd_mensagem_destino: number | null
  is_aguardar: boolean
  is_finalizar: boolean
  id_setor: string | null
  no_setor?: string | null
  id_campo: string | null
  sg_chat_status?: 'A' | 'H' | 'I' | 'P' | null
  pos_x?: number | null
  pos_y?: number | null
  botoes: Botao[]
}

export type Funil = {
  id: string
  name: string
  description: string | null
  cadastro: Mensagem[]
  chatbot: Mensagem[]
  campos: Campo[]
  setores: Setor[]
}

export type CampoTipo = {
  cd_campo_tipo: number
  ds_campo_tipo: string
  gn_campo_erro: string | null
}

export type Campo = {
  id_campo: string
  id_funil: string
  no_campo: string
  ds_label: string | null
  cd_campo_tipo: number
  ds_campo_tipo?: string
  is_obrigatorio: boolean
}

export type Setor = {
  id_setor: string
  id_funil: string
  no_setor: string
}

/* ===================== FUNIL ===================== */

export async function listarFunis() {
  const res = await fetch(BASE)
  return handle<{ id: string; name: string; description: string | null }[]>(res)
}

export async function buscarFunil(id: string) {
  const res = await fetch(`${BASE}/${id}`)
  return handle<Funil>(res)
}

export async function criarFunil(data: { name: string; description?: string | null }) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handle<{ id_funil: string }>(res)
}

export async function salvarEstrutura(
  id: string,
  data: { cadastro: Mensagem[]; chatbot: Mensagem[] }
) {
  const res = await fetch(`${BASE}/${id}/estrutura`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handle<{ success: boolean }>(res)
}

/* ===================== CAMPOS ===================== */

export async function listarTiposCampo() {
  const res = await fetch(`${BASE}/campos/tipos`)
  return handle<CampoTipo[]>(res)
}

export async function listarCampos() {
  const res = await fetch(`${BASE}/campos`)
  return handle<Campo[]>(res)
}

export async function criarCampo(
  idFunil: string,
  data: { no_campo: string; ds_label?: string; cd_campo_tipo: number; is_obrigatorio: boolean }
) {
  const res = await fetch(`${BASE}/${idFunil}/campos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handle<{ id_campo: string }>(res)
}

export async function removerCampo(idFunil: string, idCampo: string) {
  const res = await fetch(`${BASE}/${idFunil}/campos/${idCampo}`, { method: 'DELETE' })
  return handle<{ success: boolean }>(res)
}

/* ===================== SETORES ===================== */

export async function listarSetores() {
  const res = await fetch(`${BASE2}/setores`)
  return handle<Setor[]>(res)
}

export async function criarSetor(data: { no_setor: string }) {
  const res = await fetch(`${BASE}/setores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handle<{ id_setor: string }>(res)
}

export async function removerSetor(idFunil: string, idSetor: string) {
  const res = await fetch(`${BASE}/${idFunil}/setores/${idSetor}`, { method: 'DELETE' })
  return handle<{ success: boolean }>(res)
}