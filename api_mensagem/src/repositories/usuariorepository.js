//src/repositories/usuariorepository.js
const db = require("../config/db")

/**
 * Busca um usuário pelo no_usuario OU gn_email (o campo "login" do form
 * aceita os dois). Traz gn_senha só para a comparação do bcrypt no service.
 */
async function findByLoginOrEmail(login) {
  const query = `
    SELECT id_usuario, no_usuario, nu_sessao, gn_email, gn_senha, is_lembrar
    FROM tbl_usuario
    WHERE no_usuario = $1 OR gn_email = $1
    LIMIT 1
  `;

  const { rows } = await db.query(query, [login]);
  return rows[0] || null;
}

/**
 * Busca um usuário pelo token de sessão (nu_sessao). Usado na validação
 * de sessão em toda requisição autenticada.
 */
async function findBySessao(nu_sessao) {
  const query = `
    SELECT id_usuario, no_usuario, gn_email, is_lembrar
    FROM tbl_usuario
    WHERE TRIM(nu_sessao) = $1
    LIMIT 1
  `;

  const { rows } = await db.query(query, [nu_sessao]);
  return rows[0] || null;
}

/**
 * Grava o novo token de sessão (gerado no login) e a preferência de
 * "lembrar-me" do usuário.
 */
async function updateSessao(id_usuario, nu_sessao, is_lembrar) {
  const query = `
    UPDATE tbl_usuario
    SET nu_sessao = $2,
        is_lembrar = $3
    WHERE id_usuario = $1
    RETURNING id_usuario, no_usuario, gn_email, is_lembrar
  `;

  const { rows } = await db.query(query, [
    id_usuario,
    nu_sessao,
    is_lembrar,
  ]);

  return rows[0];
}

/**
 * Limpa o token de sessão no logout.
 */
async function clearSessao(id_usuario) {
  const query = `
    UPDATE tbl_usuario
    SET nu_sessao = NULL
    WHERE id_usuario = $1
  `;

  await db.query(query, [id_usuario]);
}

/**
 * Cria um novo usuário no banco gerando o ID via aplicação.
 */
async function createUser({ id_usuario, no_usuario, gn_email, gn_senha }) {
  const query = `
    INSERT INTO tbl_usuario (id_usuario, no_usuario, gn_email, gn_senha, is_lembrar)
    VALUES ($1, $2, $3, $4, false)
    RETURNING id_usuario, no_usuario, gn_email
  `;

  const { rows } = await db.query(query, [
    id_usuario,
    no_usuario,
    gn_email,
    gn_senha,
  ]);

  return rows[0];
}

module.exports = {
  findByLoginOrEmail,
  findBySessao,
  updateSessao,
  clearSessao,
  createUser,
};