const db = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const instanceManager = require('../InstanceManager')

const DEFAULT_FUNIL_ID = 'e1e4748f-aa5b-4981-8694-81dc5aabde9c'

async function processWhatsAppMessage({
  telefone,
  jid,
  texto,
  instanceName
}) {
  /* =======================
     1️⃣ UTILIZADOR
  ======================= */
  let vIdUtilizador

  const rUser = await db.query(
    `SELECT id_utilizador FROM tbl_utilizador
     WHERE nu_telefone = $1 OR cd_whatsapp = $2`,
    [telefone, jid]
  )

  if (rUser.rows.length > 0) {
    vIdUtilizador = rUser.rows[0].id_utilizador
  } else {
    vIdUtilizador = uuidv4()
    await db.query(
      `INSERT INTO tbl_utilizador (id_utilizador, nu_telefone, cd_whatsapp)
       VALUES ($1,$2,$3)`,
      [vIdUtilizador, telefone, jid]
    )
  }

  /* =======================
     2️⃣ FUNIL
  ======================= */
  const rFunil = await db.query(
    `SELECT * FROM tbl_funil_utilizador
     WHERE id_utilizador = $1 AND id_funil = $2
     ORDER BY dh_mensagem DESC
     LIMIT 1`,
    [vIdUtilizador, DEFAULT_FUNIL_ID]
  )

  let cdMensagemAtual = 1
  let idFunilUtilizador

  if (rFunil.rows.length > 0) {
    cdMensagemAtual = rFunil.rows[0].cd_mensagem_cadastro + 1
    idFunilUtilizador = rFunil.rows[0].id_funil_utilizador
  } else {
    idFunilUtilizador = uuidv4()
    await db.query(
      `INSERT INTO tbl_funil_utilizador
       (id_funil_utilizador, id_funil, id_utilizador, cd_mensagem_cadastro, dh_mensagem)
       VALUES ($1,$2,$3,$4,$5)`,
      [idFunilUtilizador, DEFAULT_FUNIL_ID, vIdUtilizador, 0, new Date()]
    )
  }

  /* =======================
     3️⃣ BUSCAR MENSAGEM DO FUNIL
  ======================= */
  const rMsg = await db.query(
    `SELECT ds_mensagem
     FROM tbl_funil_cadastro
     WHERE id_funil = $1 AND cd_mensagem = $2
     LIMIT 1`,
    [DEFAULT_FUNIL_ID, cdMensagemAtual]
  )

  if (rMsg.rows.length === 0) {
    return { finished: true }
  }

  const textoResposta = rMsg.rows[0].ds_mensagem

  /* =======================
     4️⃣ ENVIAR (USANDO NOSSA FUNÇÃO)
  ======================= */
  await instanceManager.sendTextMessageByName(
    instanceName,
    telefone,
    textoResposta
  )

  /* =======================
     5️⃣ ATUALIZAR FUNIL
  ======================= */
  await db.query(
    `UPDATE tbl_funil_utilizador
     SET cd_mensagem_cadastro = $1, dh_mensagem = $2
     WHERE id_funil_utilizador = $3`,
    [cdMensagemAtual, new Date(), idFunilUtilizador]
  )

  return { success: true }
}

module.exports = { processWhatsAppMessage }
