// src/services/funil.service.js
const db = require('../config/db')

const FunilRepository = require('../repositories/funil.repository')
const FunilCadastroRepository = require('../repositories/funilCadastro.repository')
const FunilCadastroBotaoRepository = require('../repositories/funilCadastroBotao.repository')
const FunilChatbotRepository = require('../repositories/funilChatbot.repository')
const FunilChatbotBotaoRepository = require('../repositories/funilChatbotBotao.repository')
const CampoRepository = require('../repositories/campo.repository')
const CampoTipoRepository = require('../repositories/campoTipo.repository')
const SetorRepository = require('../repositories/setor.repository')

class FunilService {
  async listar() {
    return FunilRepository.listar()
  }

  async buscarPorId(id_funil) {
    const funil = await FunilRepository.buscarPorId(id_funil)
    if (!funil) return null

    const [campos, setores] = await Promise.all([
      CampoRepository.listarCampos(id_funil),
      SetorRepository.listarCampos(id_funil),
    ])

    return { ...funil, campos, setores }
  }

  async criar({ id_funil, name, description }) {
    if (!name) throw new Error('Nome é obrigatório')
    return FunilRepository.criar({ id_funil, name, description })
  }

  /**
   * Substitui TODAS as mensagens de cadastro e chatbot do funil pelas
   * recebidas do editor visual. Isso é seguro porque o motor
   * (funil.helper.js) referencia o estado da conversa do usuário por
   * cd_mensagem (um inteiro), nunca pelo id_funil_cadastro/id_funil_chatbot
   * (UUID) — então recriar as linhas mantendo os mesmos códigos não
   * quebra conversas em andamento.
   *
   * IMPORTANTE: cd_mensagem = 0 é sempre a mensagem inicial (tanto do
   * cadastro quanto do chatbot) — é nela que createFunilUtilizador() e
   * direcionarParaAberto() reiniciam o fluxo.
   *
   * @param {string} id_funil
   * @param {{ cadastro: Array, chatbot: Array }} estrutura
   */
  async salvarEstrutura(id_funil, { cadastro, chatbot }) {
    if (!id_funil) throw new Error('Funil inválido')
    if (!Array.isArray(cadastro) || cadastro.length === 0) {
      throw new Error('O fluxo de cadastro precisa ter ao menos a mensagem inicial (cd_mensagem = 0)')
    }
    if (!cadastro.some(m => m.cd_mensagem === 0)) {
      throw new Error('Falta a mensagem inicial do cadastro (cd_mensagem = 0)')
    }
    if (Array.isArray(chatbot) && chatbot.length > 0 && !chatbot.some(m => m.cd_mensagem === 0)) {
      throw new Error('Falta a mensagem inicial do chatbot (cd_mensagem = 0)')
    }

    const client = await db.connect()

    try {
      await client.query('BEGIN')

      // 1) apaga botões primeiro (dependem das mensagens), depois as mensagens
      await FunilCadastroBotaoRepository.removerPorFunil(client, id_funil)
      await FunilChatbotBotaoRepository.removerPorFunil(client, id_funil)
      await FunilCadastroRepository.removerPorFunil(client, id_funil)
      await FunilChatbotRepository.removerPorFunil(client, id_funil)

      // 2) recria cadastro
      for (const msg of cadastro) {
        if (!msg.ds_mensagem) continue

        const idMsg = await FunilCadastroRepository.criar(client, {
          id_funil,
          cd_mensagem: msg.cd_mensagem,
          ds_mensagem: msg.ds_mensagem,
          cd_mensagem_destino: msg.cd_mensagem_destino ?? null,
          is_aguardar: !!msg.is_aguardar,
          is_finalizar: !!msg.is_finalizar,
          id_setor: msg.id_setor ?? null,
          id_campo: msg.id_campo ?? null,
          pos_x: msg.pos_x ?? null,
          pos_y: msg.pos_y ?? null,
        })

        for (const botao of msg.botoes ?? []) {
          if (!botao.ds_botao) continue
          await FunilCadastroBotaoRepository.criar(client, {
            id_funil_cadastro: idMsg,
            cd_botao: botao.cd_botao,
            ds_botao: botao.ds_botao,
            cd_mensagem_destino: botao.cd_mensagem_destino ?? null,
          })
        }
      }

      // 3) recria chatbot
      for (const msg of chatbot ?? []) {
        if (!msg.ds_mensagem) continue

        const idMsg = await FunilChatbotRepository.criar(client, {
          id_funil,
          cd_mensagem: msg.cd_mensagem,
          ds_mensagem: msg.ds_mensagem,
          cd_mensagem_destino: msg.cd_mensagem_destino ?? null,
          is_aguardar: !!msg.is_aguardar,
          is_finalizar: !!msg.is_finalizar,
          id_setor: msg.id_setor ?? null,
          id_campo: msg.id_campo ?? null,
          sg_chat_status: msg.sg_chat_status ?? null,
          pos_x: msg.pos_x ?? null,
          pos_y: msg.pos_y ?? null,
        })

        for (const botao of msg.botoes ?? []) {
          if (!botao.ds_botao) continue
          await FunilChatbotBotaoRepository.criar(client, {
            id_funil_chatbot: idMsg,
            cd_botao: botao.cd_botao,
            ds_botao: botao.ds_botao,
            cd_mensagem_destino: botao.cd_mensagem_destino ?? null,
          })
        }
      }

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /* ================= CAMPOS PERSONALIZADOS ================= */

  async listarTiposCampo() {
    return CampoTipoRepository.listar()
  }

  async listarCampos() {
    return CampoRepository.listarCampos()
  }

  async criarCampo({ no_campo, ds_label, cd_campo_tipo, is_obrigatorio }) {
    if (!no_campo) throw new Error('Nome do campo é obrigatório')
    if (!cd_campo_tipo) throw new Error('Tipo do campo é obrigatório')
    return CampoRepository.criar({ no_campo, ds_label, cd_campo_tipo, is_obrigatorio })
  }

  async atualizarCampo(id_campo, data) {
    return CampoRepository.atualizar(id_campo, data)
  }

  async removerCampo(id_campo) {
    return CampoRepository.remover(id_campo)
  }

  /* ================= SETORES ================= */

  async listarSetores(id_funil) {
    return SetorRepository.listarCampos(id_funil)
  }

  async criarSetor(id_funil, { no_setor }) {
    if (!no_setor) throw new Error('Nome do setor é obrigatório')
    return SetorRepository.criar({ id_funil, no_setor })
  }

  async atualizarSetor(id_setor, data) {
    return SetorRepository.atualizar(id_setor, data)
  }

  async removerSetor(id_setor) {
    return SetorRepository.remover(id_setor)
  }
}

module.exports = new FunilService()