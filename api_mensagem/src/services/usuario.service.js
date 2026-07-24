//src/services/usuario.service.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const usuarioRepository = require("../repositories/usuariorepository");

function erroComStatus(mensagem, status) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

async function login(login, senha, lembrar) {
  const usuario = await usuarioRepository.findByLoginOrEmail(login);

  if (!usuario) {
    throw erroComStatus("Usuário ou senha inválidos.", 401);
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.gn_senha);

  if (!senhaConfere) {
    throw erroComStatus("Usuário ou senha inválidos.", 401);
  }

  // nu_sessao funciona como o token: gerado a cada login e gravado na tbl_usuario.
  const nu_sessao = crypto.randomUUID();

  const usuarioAtualizado = await usuarioRepository.updateSessao(
    usuario.id_usuario,
    nu_sessao,
    Boolean(lembrar)
  );

  return {
    token: nu_sessao,
    usuario: {
      id_usuario: usuarioAtualizado.id_usuario,
      no_usuario: usuarioAtualizado.no_usuario,
      gn_email: usuarioAtualizado.gn_email,
    },
  };
}

async function validate(token) {
  if (!token) {
    throw erroComStatus("Sessão não informada.", 401);
  }

  const usuario = await usuarioRepository.findBySessao(token);

  if (!usuario) {
    throw erroComStatus("Sessão inválida ou expirada.", 401);
  }

  return usuario;
}

async function logout(id_usuario) {
  await usuarioRepository.clearSessao(id_usuario);
}

async function cadastrar({ no_usuario, gn_email, senha }) {
  if (!no_usuario || !gn_email || !senha) {
    throw erroComStatus("Preencha todos os campos obrigatórios.", 400);
  }

  // Verifica se usuário ou e-mail já existem no banco
  const usuarioExistente = await usuarioRepository.findByLoginOrEmail(gn_email) ||
                           await usuarioRepository.findByLoginOrEmail(no_usuario);

  if (usuarioExistente) {
    throw erroComStatus("Usuário ou e-mail já cadastrado.", 409);
  }

  // Gera um UUID para a coluna char id_usuario e criptografa a senha
  const id_usuario = crypto.randomUUID();
  const gn_senha = await bcrypt.hash(senha, 10);

  const novoUsuario = await usuarioRepository.createUser({
    id_usuario,
    no_usuario,
    gn_email,
    gn_senha,
  });

  return novoUsuario;
}

module.exports = { login, validate, logout, cadastrar };