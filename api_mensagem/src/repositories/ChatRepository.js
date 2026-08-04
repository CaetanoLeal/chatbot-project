// repository/ChatRepository.js
"use strict"

const db = require("../config/db")

/* ============================================================
   LISTA DE CHATS PARA O PAINEL
   ------------------------------------------------------------
   Como não podemos alterar tbl_chat, nada aqui é uma coluna
   persistida — tudo é derivado a cada consulta:

   - setor atual  : último registro de tbl_funil_utilizador
                    daquele utilizador (id_setor).
   - atendente atual: atendente da ÚLTIMA mensagem from_me
                    daquele chat (tbl_mensagem.id_atendente,
                    coluna que já existe no seu schema).

   Ordena: chats PENDENTES (P) sempre no topo, depois por
   mensagem mais recente.
   ============================================================ */
async function listChats() {
  const { rows } = await db.query(`
    SELECT
      c.*,
      u.no_utilizador,
      u.nu_telefone,
      p.ds_provider,
      i.no_instancia,
      i.id_funil,
      fu.id_setor,
      s.no_setor,
      lm.id_atendente,
      at.no_atendente
    FROM tbl_chat c
    LEFT JOIN tbl_utilizador u
      ON u.id_utilizador = c.id_utilizador
    LEFT JOIN tbl_provider p
      ON p.cd_provider = c.cd_provider
    LEFT JOIN tbl_instancia i
      ON i.id_instancia = c.id_instancia
    LEFT JOIN LATERAL (
      SELECT fu2.id_setor
      FROM tbl_funil_utilizador fu2
      WHERE fu2.id_utilizador = c.id_utilizador
      ORDER BY fu2.dh_mensagem DESC NULLS LAST
      LIMIT 1
    ) fu ON true
    LEFT JOIN tbl_setor s
      ON s.id_setor = fu.id_setor
    LEFT JOIN LATERAL (
      SELECT m2.id_atendente
      FROM tbl_mensagem m2
      WHERE m2.id_chat = c.id_chat
        AND m2.from_me = true
        AND m2.id_atendente IS NOT NULL
      ORDER BY m2.dh_envio DESC
      LIMIT 1
    ) lm ON true
    LEFT JOIN tbl_atendente at
      ON at.id_atendente = lm.id_atendente
    ORDER BY
      CASE WHEN c.sg_chat_status = 'P' THEN 0 ELSE 1 END,
      c.dh_ultima_mensagem DESC NULLS LAST
  `)

  return rows
}

async function getMessagesByChat(id_chat) {
  const { rows } = await db.query(
    `
    SELECT
      m.*,
      at.no_atendente
    FROM tbl_mensagem m
    LEFT JOIN tbl_atendente at ON at.id_atendente = m.id_atendente
    WHERE m.id_chat = $1
    ORDER BY m.dh_envio ASC
    `,
    [id_chat]
  )

  return rows
}

/* ============================================================
   Busca um chat com tudo que é preciso para enviar mensagem
   (provider/telefone/instância) e para sincronizar com o
   funil (id_utilizador/id_funil), já trazendo o setor atual
   (via tbl_funil_utilizador) para validar se o atendente
   selecionado pode responder esse chat.
   ============================================================ */
async function getChatById(id_chat) {
  const { rows } = await db.query(
    `
    SELECT
      c.*,
      i.no_instancia,
      i.id_funil,
      u.cd_whatsapp,
      u.cd_telegram,
      u.nu_telefone,
      u.no_utilizador,
      fu.id_setor
    FROM tbl_chat c
    LEFT JOIN tbl_instancia i ON i.id_instancia = c.id_instancia
    LEFT JOIN tbl_utilizador u ON u.id_utilizador = c.id_utilizador
    LEFT JOIN LATERAL (
      SELECT fu2.id_setor
      FROM tbl_funil_utilizador fu2
      WHERE fu2.id_utilizador = c.id_utilizador
      ORDER BY fu2.dh_mensagem DESC NULLS LAST
      LIMIT 1
    ) fu ON true
    WHERE c.id_chat = $1
    LIMIT 1
    `,
    [id_chat]
  )

  return rows[0] ?? null
}

/* ============================================================
   Busca um setor ativo pelo id. Usado para validar o destino
   antes de transferir um atendimento pra ele.
   ============================================================ */
async function getSetorById(id_setor) {
  const { rows } = await db.query(
    `
    SELECT id_setor, no_setor
    FROM tbl_setor
    WHERE id_setor = $1
      AND is_excluido IS NOT TRUE
    LIMIT 1
    `,
    [id_setor]
  )

  return rows[0] ?? null
}

module.exports = {
  listChats,
  getMessagesByChat,
  getChatById,
  getSetorById,
}