// src/services/contato.service.js
"use strict"

const ContatoRepository = require("../repositories/contato.repository")

class ContatoService {
  async listarContatos() {
    const [linhas, chats] = await Promise.all([
      ContatoRepository.listarUtilizadoresComFunisECampos(),
      ContatoRepository.listarChatsPorUtilizador(),
    ])

    /* ---------------------------------------------------------
       chat com status ABERTO por utilizador (pra linkar histórico).
       Se houver mais de um, fica com o de dh_ultima_mensagem mais
       recente (a lista já vem ordenada assim do repository).
    --------------------------------------------------------- */
    const chatAbertoPorUtilizador = new Map()
    for (const chat of chats) {
      if (chat.sg_chat_status !== "A") continue
      if (!chatAbertoPorUtilizador.has(chat.id_utilizador)) {
        chatAbertoPorUtilizador.set(chat.id_utilizador, chat.id_chat)
      }
    }

    /* ---------------------------------------------------------
       Agrupamento: utilizador -> funil_utilizador -> campos
    --------------------------------------------------------- */
    const contatosPorId = new Map()

    for (const linha of linhas) {
      let contato = contatosPorId.get(linha.id_utilizador)

      if (!contato) {
        const plataformas = []
        if (linha.cd_whatsapp) plataformas.push("whatsapp")
        if (linha.cd_telegram) plataformas.push("telegram")

        contato = {
          id: linha.id_utilizador,
          nome: linha.no_utilizador || "Sem nome",
          telefone: linha.nu_telefone || linha.cd_whatsapp || linha.cd_telegram || "-",
          plataformas,
          idChatHistorico: chatAbertoPorUtilizador.get(linha.id_utilizador) ?? null,
          funis: [],
          _funisPorId: new Map(), // auxiliar, removido antes de retornar
        }
        contatosPorId.set(linha.id_utilizador, contato)
      }

      if (!linha.id_funil_utilizador) continue // utilizador sem nenhum funil ainda

      let funil = contato._funisPorId.get(linha.id_funil_utilizador)
      if (!funil) {
        funil = {
          nome: linha.no_funil || "Funil",
          idFunil: linha.id_funil,
          ultimoContato: linha.dh_mensagem,
          status: linha.sg_chat_status,
          campos: [],
        }
        contato._funisPorId.set(linha.id_funil_utilizador, funil)
        contato.funis.push(funil)
      }

      if (linha.no_campo) {
        funil.campos.push({
          no_campo: linha.no_campo,
          vl_campo: linha.vl_campo,
        })
      }
    }

    return Array.from(contatosPorId.values()).map(({ _funisPorId, ...contato }) => contato)
  }
}

module.exports = new ContatoService()