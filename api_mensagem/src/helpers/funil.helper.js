// helpers/funil.helper.js
"use strict"

const db        = require("../config/db")
const logger    = require("../../logger")
const { v4: uuidv4 } = require("uuid")
const { FUNIL_EXPIRACAO_MIN } = require("../constants/chatbot.constants.js")
const iaService = require("../services/iaService")
const socketBus = require("../socket")

/* ============================================================
   STATUS DO CHAT
   C = CADASTRO | B = CHATBOT | H = HUMANO | I = INTELIGENCIA ARTIFICIAL
   P = PENDENTE | A = ABERTO
   ============================================================
   Fluxo:
   C -> B (cadastro concluído)
   B -> A | H | I | P   (definido pelo sg_chat_status da msg finalizadora)
   A -> B (reinicia no código 0 assim que chega nova mensagem)
   P -> H (assim que detectamos um from_me para o utilizador em P)
   H -> A (troca MANUAL, feita fora do bot, ex: painel admin)
   I -> enquanto sg_chat_status = 'I', toda mensagem do utilizador é
        respondida pela OpenAI (ver _processarEtapaIA), usando a
        configuração de tbl_funil_ia. O restante do funil fica em
        silêncio nesse estado.
   ============================================================ */
const CHAT_STATUS = {
  CADASTRO : "C",
  CHATBOT  : "B",
  HUMANO   : "H",
  IA       : "I",
  PENDENTE : "P",
  ABERTO   : "A",
}

/* ============================================================
   SETORES FIXOS
   ============================================================ */
const SETOR = {
  CADASTRO : "00000000-0000-0000-0000-000000000000",
  CHATBOT  : "11111111-1111-1111-1111-111111111111",
  IA       : "22222222-2222-2222-2222-222222222222",
}

/* ============================================================
   DETECÇÃO DE COMPORTAMENTO DA MENSAGEM
   ============================================================ */
function verificarComportamentoMensagem(msg) {
  if (!msg) return "INEXISTENTE"
  if (msg.is_finalizar) return "FINALIZAR"
  if (msg.is_aguardar) return "AGUARDAR_RESPOSTA"
  if (msg.botoes && msg.botoes.length > 0) return "AGUARDAR_BOTAO"
  if (msg.cd_mensagem_destino !== null && msg.cd_mensagem_destino !== undefined) return "DIRECIONAMENTO"
  return "FINALIZAR"
}

/* ============================================================
   VALIDAÇÃO DOS TIPOS DE CAMPO
   ============================================================ */
function validarTipoCampo(valor, cdCampoTipo) {
  if (!valor) return false
  const v = valor.trim()

  switch (Number(cdCampoTipo)) {
    case 1: // TEXTO
      return v.length > 0
    case 2: // NÚMERO
      return /^\d+$/.test(v)
    case 3: // MONETARIO
      return /^\d+(?:[.,]\d{1,2})?$/.test(v)
    case 4: // DATA (DD/MM/AAAA)
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return false
      const [d, m, a] = v.split("/").map(Number)
      const date = new Date(a, m - 1, d)
      return date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === a
    case 5: // HORA (HH:MM)
      if (!/^\d{2}:\d{2}$/.test(v)) return false
      const [h, min] = v.split(":").map(Number)
      return h >= 0 && h < 24 && min >= 0 && min < 60
    case 6: // DECIMAIS
      return /^\d+(?:[.,]\d+)?$/.test(v)
    default:
      return true
  }
}

/* ============================================================
   EXTRAÇÃO DE IDENTIFICADORES
   ============================================================ */
function extrairNumeroWhatsapp({ jid, jidAlt, raw }) {
  const candidatos = [jidAlt, jid, raw?.key?.participant, raw?.key?.remoteJid]

  for (const item of candidatos) {
    if (!item) continue
    if (item.includes("@s.whatsapp.net")) return item.split("@")[0].split(":")[0]
  }
  for (const item of candidatos) {
    if (!item) continue
    if (item.includes("@")) return item.split("@")[0].split(":")[0]
  }
  return null
}

function extrairIdentificadorTelegram(msg) {
  return (
    msg?.fromId?.userId?.toString() ||
    msg?.peerId?.userId?.toString() ||
    null
  )
}

function isStatusBroadcast(...jids) {
  return jids.some(
    jid => typeof jid === "string" && jid.includes("status@broadcast")
  )
}

/* ============================================================
   UTILIZADOR
   ============================================================ */
async function getOrCreateUtilizador({ cdTelegram, cdWhatsapp, telefone, nome }) {
  const campo = cdTelegram ? "cd_telegram" : "cd_whatsapp"
  const valor = cdTelegram || cdWhatsapp

  const rUser = await db.query(
    `SELECT id_utilizador FROM tbl_utilizador WHERE ${campo} = $1`,
    [valor]
  )
  if (rUser.rows.length > 0) return rUser.rows[0].id_utilizador

  const idUtilizador = uuidv4()
  await db.query(
    `INSERT INTO tbl_utilizador
       (id_utilizador, no_utilizador, nu_telefone, cd_whatsapp, cd_telegram)
     VALUES ($1,$2,$3,$4,$5)`,
    [idUtilizador, nome ?? null, telefone ?? null, cdWhatsapp ?? null, cdTelegram ?? null]
  )
  logger.info(`🆕 Utilizador criado (${idUtilizador})`)
  return idUtilizador
}

/* ============================================================
   HELPER — tempo de expiração (1ª régua) do funil
   ============================================================ */
async function _getMinutosExpiracaoInicial(idFunil) {
  const rExp = await db.query(
    `SELECT qt_minutos FROM tbl_funil_expiracao WHERE id_funil = $1 AND nu_sequencia = 1 LIMIT 1`,
    [idFunil]
  )
  return rExp.rows.length > 0 ? rExp.rows[0].qt_minutos : FUNIL_EXPIRACAO_MIN
}

/* ============================================================
   HELPER — emite CHAT_UPDATED sempre que status/setor mudam
   ============================================================ */
async function _emitChatUpdated(idUtilizador, idFunil) {
  try {
    const r = await db.query(
      `SELECT c.id_chat, c.sg_chat_status, s.id_setor, s.no_setor
         FROM tbl_chat c
        INNER JOIN tbl_instancia i ON i.id_instancia = c.id_instancia
        LEFT JOIN tbl_setor s ON s.id_setor = (
          SELECT fu2.id_setor FROM tbl_funil_utilizador fu2
          WHERE fu2.id_utilizador = c.id_utilizador
          ORDER BY fu2.dh_mensagem DESC NULLS LAST LIMIT 1
        )
        WHERE c.id_utilizador = $1 AND i.id_funil = $2
        ORDER BY c.dh_ultima_mensagem DESC NULLS LAST
        LIMIT 1`,
      [idUtilizador, idFunil]
    )
    if (r.rows.length === 0) return
    const row = r.rows[0]

    socketBus.emit("CHAT_UPDATED", {
      idChat      : row.id_chat,
      sgChatStatus: row.sg_chat_status,
      idSetor     : row.id_setor,
      noSetor     : row.no_setor,
    })
  } catch (err) {
    logger.error("❌ Falha ao emitir CHAT_UPDATED:", err.message)
  }
}

/* ============================================================
   FUNIL UTILIZADOR
   ============================================================ */
async function getFunilUtilizador(idUtilizador, idFunil) {
  const r = await db.query(
    `SELECT * FROM tbl_funil_utilizador
     WHERE id_utilizador = $1 AND id_funil = $2
     LIMIT 1`,
    [idUtilizador, idFunil]
  )
  return r.rows[0] ?? null
}

async function createFunilUtilizador(idUtilizador, idFunil) {
  const now  = new Date()
  const mins = await _getMinutosExpiracaoInicial(idFunil)

  // Sempre inicia no setor de CADASTRO
  await db.query(
    `INSERT INTO tbl_funil_utilizador
       (id_funil_utilizador, id_funil, id_utilizador,
        id_setor, sg_chat_status,
        cd_mensagem_cadastro, cd_mensagem_chatbot,
        dh_mensagem, dh_expiracao, nu_expiracao, is_cadastrado)
     VALUES ($1,$2,$3,$4,'C',0,0,$5, NOW() + ($6 || ' minutes')::INTERVAL, 1, false)`,
    [uuidv4(), idFunil, idUtilizador, SETOR.CADASTRO, now, mins]
  )
  logger.info(`📋 Funil inicializado para utilizador ${idUtilizador}`)
}

async function atualizarCadastroMensagem(idUtilizador, idFunil, cdMensagem) {
  const mins = await _getMinutosExpiracaoInicial(idFunil)

  // Força atualização para o setor de CADASTRO sempre que progredir no cadastro
  await db.query(
    `UPDATE tbl_funil_utilizador
     SET cd_mensagem_cadastro = $1,
         id_setor = $2,
         dh_mensagem = NOW(),
         nu_expiracao = 1,
         dh_expiracao = NOW() + ($3 || ' minutes')::INTERVAL
     WHERE id_utilizador = $4 AND id_funil = $5`,
    [cdMensagem, SETOR.CADASTRO, mins, idUtilizador, idFunil]
  )
}

async function atualizarChatbotMensagem(idUtilizador, idFunil, cdMensagem) {
  const mins = await _getMinutosExpiracaoInicial(idFunil)

  // Força atualização para o setor de CHATBOT sempre que progredir no chatbot
  await db.query(
    `UPDATE tbl_funil_utilizador
     SET cd_mensagem_chatbot = $1, 
         id_setor = $2,
         dh_mensagem = NOW(),
         nu_expiracao = 1,
         dh_expiracao = NOW() + ($3 || ' minutes')::INTERVAL
     WHERE id_utilizador = $4 AND id_funil = $5`,
    [cdMensagem, SETOR.CHATBOT, mins, idUtilizador, idFunil]
  )
}

async function concluirCadastro(idUtilizador, idFunil) {
  const mins = await _getMinutosExpiracaoInicial(idFunil)

  // Ao concluir, já migra para o setor CHATBOT
  await db.query(
    `UPDATE tbl_funil_utilizador
     SET is_cadastrado = true, sg_chat_status = 'B',
         id_setor = $3, cd_mensagem_chatbot = 0, dh_mensagem = NOW(),
         nu_expiracao = 1,
         dh_expiracao = NOW() + ($4 || ' minutes')::INTERVAL
     WHERE id_utilizador = $1 AND id_funil = $2`,
    [idUtilizador, idFunil, SETOR.CHATBOT, mins]
  )
  await updateChatStatus({ idUtilizador, status: CHAT_STATUS.CHATBOT })
  await _emitChatUpdated(idUtilizador, idFunil)
  logger.info(`✅ Cadastro concluído → entrando em chatbot (utilizador ${idUtilizador})`)
}

/* ============================================================
   DIRECIONAMENTOS ESPECIAIS DE FIM DE FLUXO (chatbot)
   Disparados quando uma mensagem do tbl_funil_chatbot tem
   is_finalizar = true. O campo sg_chat_status dessa mensagem
   decide o destino: A (aberto) | H (humano) | I (ia) | P (pendente)
   ============================================================ */

async function direcionarParaAberto({ idUtilizador, idFunil }) {
  await db.query(
    `UPDATE tbl_funil_utilizador
     SET sg_chat_status = $3, dh_mensagem = NOW()
     WHERE id_utilizador = $1 AND id_funil = $2`,
    [idUtilizador, idFunil, CHAT_STATUS.ABERTO]
  )
  await updateChatStatus({ idUtilizador, status: CHAT_STATUS.ABERTO })
  await _emitChatUpdated(idUtilizador, idFunil)
  logger.info(`🏁 Utilizador ${idUtilizador} concluiu o fluxo → status ABERTO`)
}

async function direcionarParaAtendimento({ idUtilizador, idFunil, idSetor, statusDestino }) {
  // Se for direcionado para a IA, injeta o ID correto da IA
  const setorFinal = statusDestino === CHAT_STATUS.IA ? SETOR.IA : idSetor;

  await db.query(
    `UPDATE tbl_funil_utilizador
     SET sg_chat_status = $3, id_setor = $4, dh_mensagem = NOW()
     WHERE id_utilizador = $1 AND id_funil = $2`,
    [idUtilizador, idFunil, statusDestino, setorFinal ?? null]
  )
  await updateChatStatus({ idUtilizador, status: statusDestino })
  await _emitChatUpdated(idUtilizador, idFunil)

  const label = statusDestino === CHAT_STATUS.HUMANO ? "HUMANO" : "IA"
  logger.info(`👤 Utilizador ${idUtilizador} direcionado para atendimento ${label} (silêncio do bot)`)
}

async function direcionarParaPendente({ idUtilizador, idFunil, idSetor, noSetor }) {
  await db.query(
    `UPDATE tbl_funil_utilizador
     SET sg_chat_status = $3, id_setor = $4, dh_mensagem = NOW()
     WHERE id_utilizador = $1 AND id_funil = $2`,
    [idUtilizador, idFunil, CHAT_STATUS.PENDENTE, idSetor ?? null]
  )
  await updateChatStatus({ idUtilizador, status: CHAT_STATUS.PENDENTE })
  await _emitChatUpdated(idUtilizador, idFunil)

  let nomeSetor = noSetor
  if (!nomeSetor && idSetor) {
    const rSetor = await db.query(`SELECT no_setor FROM tbl_setor WHERE id_setor = $1`, [idSetor])
    nomeSetor = rSetor.rows[0]?.no_setor ?? null
  }

  logger.info(`PENDENTE: SETOR ${nomeSetor ?? "NÃO INFORMADO"}`)
}

async function aplicarStatusEspecialChatbot({ idUtilizador, idFunil, idSetor, noSetor, sgStatus }) {
  let status = sgStatus;

  if (!status) {
    if (idSetor === SETOR.IA) {
      status = CHAT_STATUS.IA;
    } else if (idSetor) {
      status = CHAT_STATUS.PENDENTE;
    } else {
      status = CHAT_STATUS.ABERTO;
    }
  }

  switch (status) {
    case CHAT_STATUS.ABERTO:
      return direcionarParaAberto({ idUtilizador, idFunil })

    case CHAT_STATUS.HUMANO:
      return direcionarParaAtendimento({ idUtilizador, idFunil, idSetor, statusDestino: CHAT_STATUS.HUMANO })

    case CHAT_STATUS.IA:
      return direcionarParaAtendimento({ idUtilizador, idFunil, idSetor, statusDestino: CHAT_STATUS.IA })

    case CHAT_STATUS.PENDENTE:
      return direcionarParaPendente({ idUtilizador, idFunil, idSetor, noSetor })

    default:
      logger.warn(`sg_chat_status desconhecido ("${status}") → aplicando fallback ABERTO`)
      return direcionarParaAberto({ idUtilizador, idFunil })
  }
}

async function verificarRespostaHumanaPendente({ idUtilizador, idFunil }) {
  if (!idFunil) return

  const estado = await getFunilUtilizador(idUtilizador, idFunil)
  if (!estado || estado.sg_chat_status !== CHAT_STATUS.PENDENTE) return

  await db.query(
    `UPDATE tbl_funil_utilizador
     SET sg_chat_status = $3, dh_mensagem = NOW()
     WHERE id_utilizador = $1 AND id_funil = $2`,
    [idUtilizador, idFunil, CHAT_STATUS.HUMANO]
  )
  await updateChatStatus({ idUtilizador, status: CHAT_STATUS.HUMANO })
  await _emitChatUpdated(idUtilizador, idFunil)
  logger.info(`🧑‍💼 Utilizador ${idUtilizador} saiu de PENDENTE → HUMANO (resposta manual detectada)`)
}

async function definirStatusManual({ idUtilizador, idFunil, status }) {
  if (!Object.values(CHAT_STATUS).includes(status)) {
    throw new Error(`Status inválido: ${status}`)
  }
  await db.query(
    `UPDATE tbl_funil_utilizador
     SET sg_chat_status = $3, dh_mensagem = NOW()
     WHERE id_utilizador = $1 AND id_funil = $2`,
    [idUtilizador, idFunil, status]
  )
  await updateChatStatus({ idUtilizador, status })
  await _emitChatUpdated(idUtilizador, idFunil)
  logger.info(`🔀 Status do utilizador ${idUtilizador} alterado manualmente para ${status}`)
}

/* ============================================================
   CAMPOS PERSONALIZADOS
   ============================================================ */
async function salvarCampoUtilizador(idUtilizador, idFunil, idCampo, dsValor) {
  const rFu = await db.query(
    `SELECT id_funil_utilizador FROM tbl_funil_utilizador
     WHERE id_utilizador = $1 AND id_funil = $2 LIMIT 1`,
    [idUtilizador, idFunil]
  )
  if (rFu.rows.length === 0) {
    logger.warn(`salvarCampoUtilizador: sem funil_utilizador para ${idUtilizador}`)
    return
  }

  const idFunilUtilizador = rFu.rows[0].id_funil_utilizador
  const now = new Date()

  await db.query(
    `INSERT INTO tbl_funil_utilizador_campo
       (id_funil_utilizador, id_campo, vl_campo, dh_cadastro, dh_atualizacao)
     VALUES ($1,$2,$3,$4,$4)
     ON CONFLICT (id_funil_utilizador, id_campo)
     DO UPDATE SET vl_campo = EXCLUDED.vl_campo, dh_atualizacao = EXCLUDED.dh_atualizacao`,
    [idFunilUtilizador, idCampo, dsValor, now]
  )
  logger.info(`💾 Campo ${idCampo} = "${dsValor}" salvo para ${idUtilizador}`)
}

/* ============================================================
   INTERPOLAÇÃO DINÂMICA DE VARIÁVEIS NA MENSAGEM {campo}
   ============================================================ */
async function interpolarMensagem(texto, idUtilizador, idFunil) {
  const regex = /\{(\w+)\}/g
  const matches = [...texto.matchAll(regex)]
  if (matches.length === 0) return texto

  const r = await db.query(
    `SELECT C.no_campo
           ,FUC.vl_campo
       FROM tbl_funil_utilizador FU
      INNER JOIN tbl_funil_utilizador_campo FUC ON FUC.id_funil_utilizador = FU.id_funil_utilizador
      INNER JOIN tbl_campo C ON C.id_campo = FUC.id_campo
      WHERE FU.id_utilizador = $1 
        AND FU.id_funil = $2`,
    [idUtilizador, idFunil]
  )

  const mapaPorNome = {}
  for (const row of r.rows) {
    mapaPorNome[row.no_campo] = row.vl_campo
  }

  return texto.replace(regex, (match, chave) => {
    return mapaPorNome[chave] !== undefined ? mapaPorNome[chave] : match
  })
}

/* ============================================================
   CHAT STATUS (tbl_chat)
   ============================================================ */
async function updateChatStatus({ idUtilizador, status }) {
  await db.query(
    `UPDATE tbl_chat SET sg_chat_status = $1 WHERE id_utilizador = $2`,
    [status, idUtilizador]
  )
}

/* ============================================================
   BUSCA DE MENSAGEM DE CADASTRO
   ============================================================ */
async function getMensagemCadastro(idFunil, cdMensagem) {
  const r = await db.query(
    `SELECT FC.id_funil_cadastro
           ,FC.id_funil
           ,FC.id_setor
           ,FC.cd_mensagem
           ,FC.ds_mensagem
           ,FC.cd_mensagem_destino
           ,FC.is_finalizar
           ,FC.is_aguardar
           ,FC.id_campo
           ,C.cd_campo_tipo
           ,C.no_campo
           ,C.is_obrigatorio
           ,CT.ds_campo_tipo
           ,CT.gn_campo_erro
       FROM tbl_funil_cadastro FC
       LEFT JOIN tbl_campo C ON C.id_campo = FC.id_campo
       LEFT JOIN tbl_campo_tipo CT ON CT.cd_campo_tipo = C.cd_campo_tipo
      WHERE FC.id_funil = $1 
        AND FC.cd_mensagem = $2
      LIMIT 1`,
    [idFunil, cdMensagem]
  )
  if (r.rows.length === 0) return null

  const row = r.rows[0]

  const rBotoes = await db.query(
    `SELECT cd_botao, ds_botao, cd_mensagem_destino
     FROM tbl_funil_cadastro_botao
     WHERE id_funil_cadastro = $1
     ORDER BY cd_botao`,
    [row.id_funil_cadastro]
  )

  return {
    id_funil_cadastro  : row.id_funil_cadastro,
    ds_mensagem        : row.ds_mensagem,
    cd_mensagem_destino: row.cd_mensagem_destino,
    is_aguardar        : row.is_aguardar,
    is_finalizar       : row.is_finalizar,
    id_campo           : row.id_campo,
    cd_campo_tipo      : row.cd_campo_tipo,
    gn_campo_erro      : row.gn_campo_erro,
    botoes             : rBotoes.rows,
  }
}

/* ============================================================
   BUSCA DE MENSAGEM DE CHATBOT
   ============================================================ */
async function getMensagemChatbot(idFunil, cdMensagem) {
  const r = await db.query(
    `SELECT FC.id_funil_chatbot
           ,FC.id_funil
           ,FC.id_setor
           ,FC.cd_mensagem
           ,FC.ds_mensagem
           ,FC.cd_mensagem_destino
           ,FC.is_finalizar
           ,FC.is_aguardar
           ,FC.id_campo
           ,C.cd_campo_tipo
           ,C.no_campo
           ,C.is_obrigatorio
           ,CT.ds_campo_tipo
           ,CT.gn_campo_erro
           ,S.no_setor
       FROM tbl_funil_chatbot FC
       LEFT JOIN tbl_campo C ON C.id_campo = FC.id_campo
       LEFT JOIN tbl_campo_tipo CT ON CT.cd_campo_tipo = C.cd_campo_tipo
       LEFT JOIN tbl_setor S ON S.id_setor = FC.id_setor
      WHERE FC.id_funil = $1
        AND FC.cd_mensagem = $2
      LIMIT 1`,
    [idFunil, cdMensagem]
  )
  if (r.rows.length === 0) return null

  const row = r.rows[0]

  const rBotoes = await db.query(
    `SELECT B.cd_botao, B.ds_botao, B.cd_mensagem_destino
       FROM tbl_funil_chatbot_botao B
      WHERE B.id_funil_chatbot = $1
      ORDER BY B.cd_botao`,
    [row.id_funil_chatbot]
  )

  return {
    id_funil_chatbot   : row.id_funil_chatbot,
    ds_mensagem        : row.ds_mensagem,
    cd_mensagem_destino: row.cd_mensagem_destino,
    is_aguardar        : row.is_aguardar,
    is_finalizar       : row.is_finalizar,
    id_campo           : row.id_campo,
    cd_campo_tipo      : row.cd_campo_tipo,
    gn_campo_erro      : row.gn_campo_erro,
    id_setor           : row.id_setor,
    no_setor           : row.no_setor,
    sg_chat_status     : row.sg_chat_status,
    botoes             : rBotoes.rows,
  }
}

/* ============================================================
   FORMATAR MENSAGEM COM BOTÕES
   ============================================================ */
function formatarMensagemComBotoes(dsMensagem, botoes) {
  if (!botoes || botoes.length === 0) return dsMensagem
  return dsMensagem + "\n\n" + botoes.map(b => `${b.cd_botao} - ${b.ds_botao}`).join("\n")
}

/* ============================================================
   MOTORES PROGRESSIVOS DE FLUXO (CHAIN DE DIRECIONAMENTO)
   ============================================================ */
async function iniciarOuProgredirCadastro(idUtilizador, idFunil, cdMensagem, sendMessage) {
  let cdAtual = cdMensagem
  
  while (true) {
    const msg = await getMensagemCadastro(idFunil, cdAtual)
    if (!msg) {
      logger.warn(`[CADASTRO] Mensagem ${cdAtual} não encontrada no funil ${idFunil}`)
      break
    }

    const textoInterpolado = await interpolarMensagem(msg.ds_mensagem, idUtilizador, idFunil)
    await sendMessage(formatarMensagemComBotoes(textoInterpolado, msg.botoes))

    const comportamento = verificarComportamentoMensagem(msg)

    if (comportamento === "FINALIZAR") {
      await _migrarParaChatbot({ idUtilizador, idFunil, sendMessage })
      break
    }

    if (comportamento === "DIRECIONAMENTO") {
      cdAtual = msg.cd_mensagem_destino
      await atualizarCadastroMensagem(idUtilizador, idFunil, cdAtual)
      continue 
    }

    break
  }
}

async function iniciarOuProgredirChatbot(idUtilizador, idFunil, cdMensagem, sendMessage) {
  let cdAtual = cdMensagem

  while (true) {
    const msg = await getMensagemChatbot(idFunil, cdAtual)
    if (!msg) {
      logger.warn(`[CHATBOT] Mensagem ${cdAtual} não encontrada no funil ${idFunil}`)
      break
    }

    const textoInterpolado = await interpolarMensagem(msg.ds_mensagem, idUtilizador, idFunil)
    await sendMessage(formatarMensagemComBotoes(textoInterpolado, msg.botoes))

    const comportamento = verificarComportamentoMensagem(msg)

    if (comportamento === "FINALIZAR") {
      await aplicarStatusEspecialChatbot({
        idUtilizador,
        idFunil,
        idSetor : msg.id_setor,
        noSetor : msg.no_setor,
        sgStatus: msg.sg_chat_status,
      })
      break
    }

    if (comportamento === "DIRECIONAMENTO") {
      cdAtual = msg.cd_mensagem_destino
      await atualizarChatbotMensagem(idUtilizador, idFunil, cdAtual)
      continue 
    }

    break
  }
}

/* ============================================================
   MOTOR PRINCIPAL DO FUNIL
   ============================================================ */
async function processarMensagem({ idUtilizador, idFunil, idChat, texto, sendMessage }) {
  if (!idFunil) {
    logger.warn("processarMensagem: sem idFunil configurado na instância")
    return
  }

  let estado = await getFunilUtilizador(idUtilizador, idFunil)

  if (!estado) {
    await createFunilUtilizador(idUtilizador, idFunil)
    await updateChatStatus({ idUtilizador, status: CHAT_STATUS.CADASTRO })

    await iniciarOuProgredirCadastro(idUtilizador, idFunil, 0, sendMessage)
    return
  }

  const { sg_chat_status, cd_mensagem_cadastro, cd_mensagem_chatbot } = estado

  if (sg_chat_status === CHAT_STATUS.CADASTRO) {
    await _processarEtapaCadastro({
      idUtilizador, idFunil, texto, sendMessage, cdMensagemAtual: cd_mensagem_cadastro
    })
    return
  }

  if (sg_chat_status === CHAT_STATUS.CHATBOT) {
    await _processarEtapaChatbot({
      idUtilizador, idFunil, texto, sendMessage, cdMensagemAtual: cd_mensagem_chatbot
    })
    return
  }

  /* -----------------------------------------------------------
     HUMANO — atendimento manual em andamento. Bot fica calado
     até alguém trocar o status manualmente para ABERTO.
  ----------------------------------------------------------- */
  if (sg_chat_status === CHAT_STATUS.HUMANO) {
    logger.info(`🙅 Bot em silêncio: utilizador ${idUtilizador} em atendimento HUMANO`)
    return
  }

  /* -----------------------------------------------------------
     IA — atendimento por inteligência artificial em andamento.
     A partir daqui só a IA fala com o utilizador: toda mensagem
     que chega é respondida via OpenAI (tbl_funil_ia), e nenhum
     outro trecho do funil roda enquanto o status for 'I'.
  ----------------------------------------------------------- */
  if (sg_chat_status === CHAT_STATUS.IA) {
    await _processarEtapaIA({ idUtilizador, idFunil, idChat, texto, sendMessage, idSetor: estado.id_setor })
    return
  }

  /* -----------------------------------------------------------
     PENDENTE — atendimento humano foi chamado mas ainda não
     começou. Bot fica calado; a saída deste status acontece
     via verificarRespostaHumanaPendente() (mensagem from_me).
  ----------------------------------------------------------- */
  if (sg_chat_status === CHAT_STATUS.PENDENTE) {
    logger.info(`⏳ Bot em silêncio: utilizador ${idUtilizador} aguardando atendimento (PENDENTE)`)
    return
  }

  /* -----------------------------------------------------------
     ABERTO — antigo "finalizado". Ao chegar mensagem nova,
     reinicia o funil do chatbot a partir do código 0.
  ----------------------------------------------------------- */
  if (sg_chat_status === CHAT_STATUS.ABERTO) {
    logger.info(`[FUNIL] utilizador ${idUtilizador} estava ABERTO → reiniciando chatbot no código 0`)

    const mins = await _getMinutosExpiracaoInicial(idFunil)

    // Força o ID do CHATBOT quando ele for reativado do status Aberto
    await db.query(
      `UPDATE tbl_funil_utilizador 
       SET sg_chat_status = 'B', 
           id_setor = $4,
           cd_mensagem_chatbot = 0, 
           dh_mensagem = NOW(),
           nu_expiracao = 1,
           dh_expiracao = NOW() + ($3 || ' minutes')::INTERVAL
       WHERE id_utilizador = $1 AND id_funil = $2`,
      [idUtilizador, idFunil, mins, SETOR.CHATBOT]
    )
    await updateChatStatus({ idUtilizador, status: CHAT_STATUS.CHATBOT })

    await iniciarOuProgredirChatbot(idUtilizador, idFunil, 0, sendMessage)
  }
}

/* ============================================================
   ETAPA CADASTRO
   ============================================================ */
async function _processarEtapaCadastro({ idUtilizador, idFunil, texto, sendMessage, cdMensagemAtual }) {
  const msg = await getMensagemCadastro(idFunil, cdMensagemAtual)

  if (!msg) {
    logger.warn(`[CADASTRO] mensagem ${cdMensagemAtual} não encontrada no funil ${idFunil}`)
    return
  }

  logger.info(`[CADASTRO] utilizador=${idUtilizador} cd=${cdMensagemAtual}`)

  const comportamento = verificarComportamentoMensagem(msg)

  if (comportamento === "AGUARDAR_RESPOSTA") {
    if (msg.id_campo && texto.trim()) {
      if (msg.cd_campo_tipo) {
        const inputValido = validarTipoCampo(texto, msg.cd_campo_tipo)
        if (!inputValido) {
          await sendMessage(msg.gn_campo_erro || "Valor informado inválido. Tente novamente.")
          return
        }
      }
      await salvarCampoUtilizador(idUtilizador, idFunil, msg.id_campo, texto.trim())
    }

    const cdProximo = msg.cd_mensagem_destino
    await atualizarCadastroMensagem(idUtilizador, idFunil, cdProximo)
    await iniciarOuProgredirCadastro(idUtilizador, idFunil, cdProximo, sendMessage)
    return
  }

  if (comportamento === "AGUARDAR_BOTAO") {
    console.log(`[CADASTRO] Botão escolhido: "${texto}"`)
    console.log(`[CADASTRO] Botão tratado: "${texto.toLowerCase().replace(/[^a-z0-9]/g, "").trim()}"`)
  
    switch (texto.toLowerCase().replace(/[^a-z0-9]/g, "").trim()) {
      case "um":
      case "hum":
      case "hmm":
      case "hnm":
      case "hmn":
      case "un":
      case "uhum":
        texto = "1"
        break
      case "dois":
        texto = "2"
        break
      case "três":
      case "tres":
        texto = "3"
        break
      case "quatro":
        texto = "4"
        break
      case "cinco":
        texto = "5"
        break
      case "seis":
        texto = "6"
        break
      case "sete":
        texto = "7"
        break
      case "oito":
        texto = "8"
        break
      case "nove":
        texto = "9"
        break
      case "dez":
        texto = "10"
        break
    }    

    const cdBotao = Number(texto.trim())

    if (!Number.isInteger(cdBotao) || cdBotao <= 0) {
      await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
      return
    }

    const botaoEscolhido = msg.botoes.find(b => b.cd_botao === cdBotao)
    if (!botaoEscolhido) {
      await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
      return
    }

    const cdProximo = botaoEscolhido.cd_mensagem_destino
    await atualizarCadastroMensagem(idUtilizador, idFunil, cdProximo)
    await iniciarOuProgredirCadastro(idUtilizador, idFunil, cdProximo, sendMessage)
    return
  }
}

/* ============================================================
   MIGRAÇÃO CADASTRO → CHATBOT
   ============================================================ */
async function _migrarParaChatbot({ idUtilizador, idFunil, sendMessage }) {
  await concluirCadastro(idUtilizador, idFunil)
  await iniciarOuProgredirChatbot(idUtilizador, idFunil, 0, sendMessage)
}

/* ============================================================
   ETAPA CHATBOT
   ============================================================ */
async function _processarEtapaChatbot({ idUtilizador, idFunil, texto, sendMessage, cdMensagemAtual }) {
  const msg = await getMensagemChatbot(idFunil, cdMensagemAtual)

  if (!msg) {
    logger.warn(`[CHATBOT] mensagem ${cdMensagemAtual} não encontrada no funil ${idFunil}`)
    return
  }

  logger.info(`[CHATBOT] utilizador=${idUtilizador} cd=${cdMensagemAtual}`)

  const comportamento = verificarComportamentoMensagem(msg)

  if (comportamento === "AGUARDAR_RESPOSTA") {
    const cdProximo = msg.cd_mensagem_destino
    await atualizarChatbotMensagem(idUtilizador, idFunil, cdProximo)
    await iniciarOuProgredirChatbot(idUtilizador, idFunil, cdProximo, sendMessage)
    return
  }

  if (comportamento === "AGUARDAR_BOTAO") {
    const cdBotao = Number(texto.trim())

    if (!Number.isInteger(cdBotao) || cdBotao <= 0) {
      await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
      return
    }

    const botaoEscolhido = msg.botoes.find(b => b.cd_botao === cdBotao)
    if (!botaoEscolhido) {
      await sendMessage("Resposta inválida! Digite o número correspondente à opção desejada.")
      return
    }

    const cdProximo = botaoEscolhido.cd_mensagem_destino
    await atualizarChatbotMensagem(idUtilizador, idFunil, cdProximo)
    await iniciarOuProgredirChatbot(idUtilizador, idFunil, cdProximo, sendMessage)
    return
  }
}

/* ============================================================
   ETAPA IA — utilizador em atendimento por Inteligência Artificial
   ============================================================ */

async function getFunilIaConfig(idSetor) {
  const r = await db.query(
    `SELECT FI.id_funil_ia
           ,FI.no_agente
           ,FI.ds_personalidade
           ,FI.nu_temperature
           ,FI.nu_max_tokens
           ,FI.is_ativo
           ,FI.ds_fallback
           ,FI.is_human_handoff
           ,FIM.ds_funil_ia_modelo
       FROM tbl_funil_ia FI
      INNER JOIN tbl_funil_ia_modelo FIM ON FIM.id_funil_ia_modelo = FI.id_funil_ia_modelo
      WHERE FI.id_setor = $1
      LIMIT 1`,
    [idSetor]
  )
  return r.rows[0] ?? null
}

function _parseNumeroDecimal(valor, fallback) {
  if (valor === null || valor === undefined) return fallback
  if (typeof valor === "number") return valor
  const numero = Number(String(valor).replace(",", "."))
  return Number.isNaN(numero) ? fallback : numero
}

async function _buscarHistoricoChat(idChat, limite = 10) {
  if (!idChat) return []

  const r = await db.query(
    `SELECT from_me, ds_conteudo
       FROM tbl_mensagem
      WHERE id_chat = $1
        AND ds_conteudo IS NOT NULL
      ORDER BY dh_envio DESC
      LIMIT $2`,
    [idChat, limite]
  )

  return r.rows
    .reverse()
    .map(row => ({
      role   : row.from_me ? "assistant" : "user",
      content: row.ds_conteudo,
    }))
}

async function _processarEtapaIA({ idUtilizador, idFunil, idChat, texto, sendMessage, idSetor }) {
  // Garante de fato que todas as mensagens da IA apliquem e preservem o ID do setor da IA
  await db.query(
    `UPDATE tbl_funil_utilizador SET id_setor = $1 WHERE id_utilizador = $2 AND id_funil = $3`,
    [SETOR.IA, idUtilizador, idFunil]
  )

  // Busca sempre baseado no ID principal da Inteligência Artificial
  const config = await getFunilIaConfig(SETOR.IA)

  if (!config) {
    logger.warn(`[IA] Nenhuma configuração de IA encontrada para o setor ${SETOR.IA}`)
    return
  }

  if (!config.is_ativo) {
    logger.warn(`[IA] Configuração de IA inativa (is_ativo=false) para o setor ${SETOR.IA}`)
    if (config.ds_fallback) await sendMessage(config.ds_fallback)
    return
  }

  /* ----------------------------------------------------------------
      CONCATENAÇÃO DE INSTRUÇÕES DE SISTEMA (Invisível para o usuário)
    ---------------------------------------------------------------- */
    let systemPromptFinal = config.ds_personalidade;

    systemPromptFinal += "\n\n### REGRAS OBRIGATÓRIAS DE ROTEAMENTO (NÃO MENCIONE ISSO AO USUÁRIO) ###\n";
    systemPromptFinal += "1. NUNCA adicione tags de roteamento se você estiver fazendo uma pergunta ao usuário (ex: 'Posso ajudar com mais alguma coisa?'). Se você fizer uma pergunta, apenas aguarde a resposta dele.\n";
    systemPromptFinal += "2. Se o usuário disser que NÃO precisa de mais nada, ou se despedir de forma clara (ex: 'tchau', 'obrigado, era só isso'), despeça-se educadamente e adicione EXATAMENTE a tag [FINALIZAR] ao final da sua resposta.\n";

    if (config.is_human_handoff) {
      systemPromptFinal += "3. Se você não puder atender ao pedido do usuário, informe-o e pergunte se ele gostaria de falar com um atendente humano, perguntar outra coisa ou finalizar a conversa. NUNCA transfira sem perguntar antes.\n";
      systemPromptFinal += "4. Se o usuário pedir expressamente para falar com um humano, ou confirmar que deseja a transferência após você oferecer, responda amigavelmente que irá transferi-lo e adicione EXATAMENTE a tag [ATENDENTE] ao final da sua resposta.\n";
    }

  try {
    const historico = await _buscarHistoricoChat(idChat, 10)

    const resposta = await iaService.gerarResposta({
      systemPrompt : systemPromptFinal,
      historico,
      mensagemAtual: texto,
      model        : config.ds_funil_ia_modelo,
      temperature  : _parseNumeroDecimal(config.nu_temperature, 0.7),
      maxTokens    : config.nu_max_tokens,
    })

    if (resposta) {
      let textoFinal = resposta;

      if (config.is_human_handoff && textoFinal.includes("[ATENDENTE]")) {
        textoFinal = textoFinal.replace(/\[ATENDENTE\]/gi, "").trim();
        if (textoFinal) await sendMessage(textoFinal);
        await direcionarParaPendente({ idUtilizador, idFunil, idSetor: SETOR.IA });
        logger.info(`🤖 [IA] Handoff disparado para utilizador ${idUtilizador} → PENDENTE`);
        return; 
      }

      if (textoFinal.includes("[FINALIZAR]")) {
        textoFinal = textoFinal.replace(/\[FINALIZAR\]/gi, "").trim();
        if (textoFinal) await sendMessage(textoFinal);
        await direcionarParaAberto({ idUtilizador, idFunil });
        logger.info(`🤖 [IA] Atendimento encerrado pela IA para utilizador ${idUtilizador} → ABERTO`);
        return; 
      }

      await sendMessage(textoFinal);
      logger.info(`🤖 [IA] Resposta enviada para utilizador ${idUtilizador}`);

    } else if (config.ds_fallback) {
      await sendMessage(config.ds_fallback)
    }

  } catch (err) {
    logger.error(`❌ [IA] Falha ao gerar resposta para utilizador ${idUtilizador}:`, err.message)
    if (config.ds_fallback) await sendMessage(config.ds_fallback)
  }
}

/* ============================================================
   CRON / CRON-JOB: ENGINE DE EXPIRAÇÃO DE SESSÕES
   ============================================================ */
async function verificarEProcessarExpiracoes(globalSendMessage) {
  try {
    const rExpirados = await db.query(
      `SELECT * FROM tbl_funil_utilizador 
       WHERE dh_expiracao <= NOW() 
         AND sg_chat_status IN ('C', 'B')`
    )

    for (const user of rExpirados.rows) {
      const { id_utilizador, id_funil, id_funil_utilizador, nu_expiracao, is_cadastrado } = user
      const sequenciaAtual = nu_expiracao || 1

      const rMsgExp = await db.query(
        `SELECT * FROM tbl_funil_expiracao 
         WHERE id_funil = $1 AND nu_sequencia = $2 
         LIMIT 1`,
        [id_funil, sequenciaAtual]
      )

      if (rMsgExp.rows.length === 0) continue

      const msgExp = rMsgExp.rows[0]

      await globalSendMessage(id_utilizador, msgExp.gn_mensagem)

      const proximaSequencia = sequenciaAtual + 1
      const rProxMsg = await db.query(
        `SELECT qt_minutos FROM tbl_funil_expiracao 
         WHERE id_funil = $1 AND nu_sequencia = $2 
         LIMIT 1`,
        [id_funil, proximaSequencia]
      )

      if (rProxMsg.rows.length > 0) {
        const proxMins = rProxMsg.rows[0].qt_minutos
        await db.query(
          `UPDATE tbl_funil_utilizador 
           SET nu_expiracao = $1, 
               dh_expiracao = NOW() + ($2 || ' minutes')::INTERVAL,
               dh_mensagem = NOW()
           WHERE id_utilizador = $3 AND id_funil = $4`,
          [proximaSequencia, proxMins, id_utilizador, id_funil]
        )
        logger.info(`⏰ Alerta ${sequenciaAtual} enviado para ${id_utilizador}. Próxima sequência ${proximaSequencia} em ${proxMins} min.`)
      } else {
        logger.info(`🔚 Sessão esgotada por inatividade. Executando encerramento para utilizador ${id_utilizador}`)

        if (!is_cadastrado) {
          const rCampos = await db.query(
            `SELECT C.no_campo, FUC.vl_campo 
             FROM tbl_funil_utilizador_campo FUC
             INNER JOIN tbl_campo C ON C.id_campo = FUC.id_campo
             WHERE FUC.id_funil_utilizador = $1`,
            [id_funil_utilizador]
          )

          if (rCampos.rows.length > 0) {
            let resumoDados = "⚠️ *Atendimento encerrado por inatividade.* Seus dados coletados até o momento:\n"
            for (const campo of rCampos.rows) {
              resumoDados += `• *${campo.no_campo}:* ${campo.vl_campo}\n`
            }
            await globalSendMessage(id_utilizador, resumoDados)
          }

          await db.query(
            `DELETE FROM tbl_funil_utilizador_campo WHERE id_funil_utilizador = $1`,
            [id_funil_utilizador]
          )

          await db.query(
            `UPDATE tbl_funil_utilizador 
             SET cd_mensagem_cadastro = 0,
                 nu_expiracao = 1,
                 dh_mensagem = NOW(),
                 dh_expiracao = NOW() + ((SELECT qt_minutos FROM tbl_funil_expiracao WHERE id_funil = $1 AND nu_sequencia = 1 LIMIT 1) || ' minutes')::INTERVAL
             WHERE id_utilizador = $2 AND id_funil = $3`,
            [id_funil, id_utilizador, id_funil]
          )
        } else {
          await db.query(
            `UPDATE tbl_funil_utilizador 
             SET cd_mensagem_chatbot = 0,
                 nu_expiracao = 1,
                 dh_mensagem = NOW(),
                 dh_expiracao = NOW() + ((SELECT qt_minutos FROM tbl_funil_expiracao WHERE id_funil = $1 AND nu_sequencia = 1 LIMIT 1) || ' minutes')::INTERVAL
             WHERE id_utilizador = $2 AND id_funil = $3`,
            [id_funil, id_utilizador, id_funil]
          )
        }
      }
    }
  } catch (error) {
    logger.error("❌ Erro ao rodar rotina preventiva de expiração:", error)
  }
}

/* ============================================================
   EXPORTS
   ============================================================ */
module.exports = {
  CHAT_STATUS,
  extrairNumeroWhatsapp,
  extrairIdentificadorTelegram,
  isStatusBroadcast,
  getOrCreateUtilizador,
  getFunilUtilizador,
  updateChatStatus,
  processarMensagem,
  verificarComportamentoMensagem,
  verificarEProcessarExpiracoes,     // usado no Cron
  verificarRespostaHumanaPendente,   // chamado no webhook message.sent
  definirStatusManual,               // uso em rotas de admin/painel (ex: mover H -> A)
  direcionarParaPendente,
  getFunilIaConfig,                  // uso opcional em rotas de admin/painel
}