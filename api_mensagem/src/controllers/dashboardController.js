const db = require("../config/db")

exports.getDashboard = async (req, res) => {
  try {
    // 📊 Atendimentos realizados (chats)
    const atendimentos = await db.query(`
      SELECT COUNT(*) FROM tbl_chat
    `)

    // 💬 Mensagens recebidas
    const mensagens = await db.query(`
      SELECT COUNT(*) 
      FROM tbl_mensagem 
      WHERE from_me = false
    `)

    // ⚙️ Instâncias ativas
    const instanciasAtivas = await db.query(`
      SELECT COUNT(*) 
      FROM tbl_instancia 
      WHERE cd_status = 1
    `)

    // 🔥 Instância mais ativa
    const instanciaMaisAtiva = await db.query(`
      SELECT i.no_instancia, COUNT(m.id_mensagem) as total
      FROM tbl_instancia i
      LEFT JOIN tbl_mensagem m 
        ON m.cd_provider = i.cd_provider
      GROUP BY i.no_instancia
      ORDER BY total DESC
      LIMIT 1
    `)

    // 🔁 Funis criados
    const funis = await db.query(`
      SELECT COUNT(*) FROM tbl_funil
    `)

    // 🧠 Funil com maior conversão
    const funilMaisUsado = await db.query(`
      SELECT f.no_funil, COUNT(fu.id_funil_utilizador) as total
      FROM tbl_funil f
      LEFT JOIN tbl_funil_utilizador fu 
        ON fu.id_funil = f.id_funil
      GROUP BY f.no_funil
      ORDER BY total DESC
      LIMIT 1
    `)

    res.json({
      atendimentos: atendimentos.rows[0].count,
      mensagens: mensagens.rows[0].count,
      instanciasAtivas: instanciasAtivas.rows[0].count,
      instanciaMaisAtiva: instanciaMaisAtiva.rows[0] || null,
      funis: funis.rows[0].count,
      funilMaisUsado: funilMaisUsado.rows[0] || null
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao carregar dashboard" })
  }
}