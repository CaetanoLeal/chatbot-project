const db = require("../config/db")

/**
 * Repositório de dados do Dashboard (Visão Geral).
 *
 * Cada função recebe um intervalo [start, end] e devolve dados brutos do banco.
 * Todas as queries usam LEFT JOIN / COALESCE onde fizer sentido para não
 * quebrar enquanto tabelas como tbl_chat, tbl_mensagem e tbl_funil_utilizador
 * ainda estão vazias (fase de testes).
 *
 * Observações sobre o schema:
 * - tbl_chat não tem id_setor direto. O setor é obtido através do vínculo
 *   utilizador -> tbl_funil_utilizador.id_setor.
 * - A "instância mais ativa" deve ser calculada via tbl_chat.id_instancia
 *   (e não via cd_provider, que representa apenas o canal whatsapp/telegram
 *   e gerava contagens infladas/erradas na versão anterior).
 */

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

async function countChats(start, end) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM tbl_chat
      WHERE dt_created_at BETWEEN $1 AND $2`,
    [start, end]
  )
  return rows[0].total
}

async function countMessages(start, end, fromMe) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM tbl_mensagem
      WHERE dh_envio BETWEEN $1 AND $2
        AND from_me = $3`,
    [start, end, fromMe]
  )
  return rows[0].total
}

async function countFinishedChats(start, end) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM tbl_chat
      WHERE dt_created_at BETWEEN $1 AND $2
        AND sg_chat_status = 'A'`,
    [start, end]
  )
  return rows[0].total
}

async function avgAttendanceMinutes(start, end) {
  const { rows } = await db.query(
    `SELECT COALESCE(
              AVG(EXTRACT(EPOCH FROM (dt_updated_at - dt_created_at)) / 60),
              0
            )::float AS minutos
       FROM tbl_chat
      WHERE dt_created_at BETWEEN $1 AND $2
        AND sg_chat_status = 'A'
        AND dt_updated_at IS NOT NULL`,
    [start, end]
  )
  return Number(rows[0].minutos.toFixed(1))
}

async function countInstances() {
  const { rows } = await db.query(`SELECT COUNT(*)::int AS total FROM tbl_instancia`)
  return rows[0].total
}

async function countActiveInstances() {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM tbl_instancia WHERE cd_status = 1`
  )
  return rows[0].total
}

async function countFunnels() {
  const { rows } = await db.query(`SELECT COUNT(*)::int AS total FROM tbl_funil`)
  return rows[0].total
}

async function countRegistrationsStarted(start, end) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM tbl_funil_utilizador
      WHERE dh_mensagem BETWEEN $1 AND $2`,
    [start, end]
  )
  return rows[0].total
}

async function countRegistrationsCompleted(start, end) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM tbl_funil_utilizador
      WHERE dh_mensagem BETWEEN $1 AND $2
        AND is_cadastrado = true`,
    [start, end]
  )
  return rows[0].total
}

// ---------------------------------------------------------------------------
// Séries temporais
// ---------------------------------------------------------------------------

async function messagesTimeline(start, end, truncUnit) {
  const { rows } = await db.query(
    `SELECT date_trunc($3, dh_envio)                          AS bucket,
            COUNT(*) FILTER (WHERE from_me = false)::int       AS recebidas,
            COUNT(*) FILTER (WHERE from_me = true)::int        AS enviadas
       FROM tbl_mensagem
      WHERE dh_envio BETWEEN $1 AND $2
      GROUP BY bucket
      ORDER BY bucket`,
    [start, end, truncUnit]
  )
  return rows
}

async function chatsTimeline(start, end, truncUnit) {
  const { rows } = await db.query(
    `SELECT date_trunc($3, dt_created_at) AS bucket,
            COUNT(*)::int                 AS total
       FROM tbl_chat
      WHERE dt_created_at BETWEEN $1 AND $2
      GROUP BY bucket
      ORDER BY bucket`,
    [start, end, truncUnit]
  )
  return rows
}

// ---------------------------------------------------------------------------
// Distribuições
// ---------------------------------------------------------------------------

async function chatsByStatus(start, end) {
  const { rows } = await db.query(
    `SELECT cs.sg_chat_status               AS codigo,
            cs.ds_chat_status               AS status,
            COUNT(c.id_chat)::int           AS total
       FROM tbl_chat_status cs
       LEFT JOIN tbl_chat c
              ON c.sg_chat_status = cs.sg_chat_status
             AND c.dt_created_at BETWEEN $1 AND $2
      GROUP BY cs.sg_chat_status, cs.ds_chat_status
      ORDER BY total DESC`,
    [start, end]
  )
  return rows
}

async function messagesByProvider(start, end) {
  const { rows } = await db.query(
    `SELECT p.ds_provider          AS provider,
            COUNT(m.id_mensagem)::int AS total
       FROM tbl_provider p
       LEFT JOIN tbl_mensagem m
              ON m.cd_provider = p.cd_provider -- Corrigido aqui de p.tbl_provider para p.cd_provider
             AND m.dh_envio BETWEEN $1 AND $2
      GROUP BY p.ds_provider
      ORDER BY total DESC`,
    [start, end]
  )
  return rows
}

async function chatsBySetor(start, end) {
  const { rows } = await db.query(
    `SELECT s.no_setor                        AS setor,
            COUNT(DISTINCT c.id_chat)::int     AS total
       FROM tbl_setor s
       LEFT JOIN tbl_funil_utilizador fu ON fu.id_setor = s.id_setor
       LEFT JOIN tbl_chat c
              ON c.id_utilizador = fu.id_utilizador
             AND c.dt_created_at BETWEEN $1 AND $2
      WHERE s.is_excluido IS NOT TRUE
      GROUP BY s.no_setor
      ORDER BY total DESC`,
    [start, end]
  )
  return rows
}

async function messagesByHour(start, end) {
  const { rows } = await db.query(
    `SELECT EXTRACT(HOUR FROM dh_envio)::int AS hora,
            COUNT(*)::int                    AS total
       FROM tbl_mensagem
      WHERE dh_envio BETWEEN $1 AND $2
      GROUP BY hora
      ORDER BY hora`,
    [start, end]
  )
  return rows
}

// ---------------------------------------------------------------------------
// Rankings
// ---------------------------------------------------------------------------

async function topFunnels(start, end, limit = 5) {
  const { rows } = await db.query(
    `SELECT f.no_funil                                                    AS funil,
            COUNT(fu.id_funil_utilizador)::int                            AS total_utilizadores,
            COUNT(fu.id_funil_utilizador)
              FILTER (WHERE fu.is_cadastrado = true)::int                 AS total_concluidos
       FROM tbl_funil f
       LEFT JOIN tbl_funil_utilizador fu
              ON fu.id_funil = f.id_funil
             AND fu.dh_mensagem BETWEEN $1 AND $2
      GROUP BY f.no_funil
      ORDER BY total_utilizadores DESC
      LIMIT $3`,
    [start, end, limit]
  )
  return rows
}

async function topInstances(start, end, limit = 5) {
  const { rows } = await db.query(
    `SELECT i.no_instancia         AS instancia,
            COUNT(m.id_mensagem)::int AS total
       FROM tbl_instancia i
       LEFT JOIN tbl_chat c ON c.id_instancia = i.id_instancia
       LEFT JOIN tbl_mensagem m
              ON m.id_chat = c.id_chat
             AND m.dh_envio BETWEEN $1 AND $2
      GROUP BY i.no_instancia
      ORDER BY total DESC
      LIMIT $3`,
    [start, end, limit]
  )
  return rows
}

// ---------------------------------------------------------------------------
// Funil de cadastro (drop-off por etapa)
// ---------------------------------------------------------------------------

async function getMainFunnelId() {
  const { rows } = await db.query(
    `SELECT f.id_funil
       FROM tbl_funil f
       LEFT JOIN tbl_funil_utilizador fu ON fu.id_funil = f.id_funil
      GROUP BY f.id_funil
      ORDER BY COUNT(fu.id_funil_utilizador) DESC, f.id_funil
      LIMIT 1`
  )
  return rows[0]?.id_funil || null
}

async function registrationFunnelSteps(id_funil) {
  // Como o schema só guarda a etapa ATUAL do utilizador (cd_mensagem_cadastro),
  // "chegou pelo menos até a etapa N" é aproximado por cd_mensagem_cadastro >= N.
  const { rows } = await db.query(
    `SELECT fc.cd_mensagem                           AS etapa,
            fc.ds_mensagem                            AS descricao,
            COUNT(fu.id_funil_utilizador)::int        AS total
       FROM tbl_funil_cadastro fc
       LEFT JOIN tbl_funil_utilizador fu
              ON fu.id_funil = fc.id_funil
             AND fu.cd_mensagem_cadastro >= fc.cd_mensagem
      WHERE fc.id_funil = $1
      GROUP BY fc.cd_mensagem, fc.ds_mensagem
      ORDER BY fc.cd_mensagem`,
    [id_funil]
  )
  return rows
}

module.exports = {
  countChats,
  countMessages,
  countFinishedChats,
  avgAttendanceMinutes,
  countInstances,
  countActiveInstances,
  countFunnels,
  countRegistrationsStarted,
  countRegistrationsCompleted,
  messagesTimeline,
  chatsTimeline,
  chatsByStatus,
  messagesByProvider,
  chatsBySetor,
  messagesByHour,
  topFunnels,
  topInstances,
  getMainFunnelId,
  registrationFunnelSteps,
}