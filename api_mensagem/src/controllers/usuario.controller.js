//src/controllers/usuario.controller.js
const authService = require("../services/usuario.service");

function extrairToken(req) {
  const authHeader = req.headers.authorization || "";
  return authHeader.replace("Bearer ", "");
}

async function login(req, res) {
  try {
    const { login: loginInput, senha, lembrar } = req.body;

    if (!loginInput || !senha) {
      return res.status(400).json({ message: "Informe usuário/e-mail e senha." });
    }

    const resultado = await authService.login(loginInput, senha, lembrar);
    return res.status(200).json(resultado);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Erro interno." });
  }
}

async function validate(req, res) {
  try {
    const usuario = await authService.validate(extrairToken(req));
    return res.status(200).json({ usuario });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Erro interno." });
  }
}

async function logout(req, res) {
  try {
    const usuario = await authService.validate(extrairToken(req)).catch(() => null);

    if (usuario) {
      await authService.logout(usuario.id_usuario);
    }

    return res.status(200).json({ message: "Sessão encerrada." });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Erro interno." });
  }
}

module.exports = { login, validate, logout };