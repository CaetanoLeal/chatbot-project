// src/repositories/contato.repository.js
"use strict"

const db = require("../config/db")

class ContatoRepository {
  /**
   * Uma linha por (utilizador x funil x campo). Vem "achatado" de propósito —
   * quem agrupa em objetos aninhados é o service, pra manter o SQL simples
   * e evitar N+1 query por contato.
   */
  async listarUtilizadoresComFunisECampos() {
    const { rows } = await db.query(
      `SELECT
          U.id_utilizador,
          U.no_utilizador,
          U.nu_telefone,
          U.cd_whatsapp,
          U.cd_telegram,
          FU.id_funil_utilizador,
          FU.id_funil,
          F.no_funil,
          FU.dh_mensagem,
          FU.sg_chat_status,
          C.no_campo,
          FUC.vl_campo
        FROM tbl_utilizador U
        LEFT JOIN tbl_funil_utilizador FU ON FU.id_utilizador = U.id_utilizador
        LEFT JOIN tbl_funil F ON F.id_funil = FU.id_funil
        LEFT JOIN tbl_funil_utilizador_campo FUC ON FUC.id_funil_utilizador = FU.id_funil_utilizador
        LEFT JOIN tbl_campo C ON C.id_campo = FUC.id_campo
       WHERE COALESCE(U.is_excluido, false) = false
       ORDER BY U.no_utilizador NULLS LAST, FU.dh_mensagem DESC NULLS LAST`
    )
    return rows
  }

  /**
   * Todos os chats de todos os utilizadores — não filtra por status aqui
   * porque o service precisa especificamente achar o chat com status 'A'
   * (não necessariamente o mais recente) pra montar o link de histórico.
   */
  async listarChatsPorUtilizador() {
    const { rows } = await db.query(
      `SELECT
          C.id_chat,
          C.id_utilizador,
          C.sg_chat_status,
          C.dh_ultima_mensagem
        FROM tbl_chat C
       WHERE COALESCE(C.is_excluido, false) = false
       ORDER BY C.dh_ultima_mensagem DESC NULLS LAST`
    )
    return rows
  }
}

module.exports = new ContatoRepository()