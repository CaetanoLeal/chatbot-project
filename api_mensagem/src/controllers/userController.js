// src/controllers/userController.js
const User = require("../models/userModel");
const logger = require("../logger");
// ajuste o caminho conforme seu projeto

async function listUsers(req, res) {
  try {
    const users = await User.getUsers();

    // Log da listagem
    logger.info(`Listagem de usuários realizada. Total: ${users.length}`);

    res.json(users);
  } catch (err) {
    // Log do erro
    logger.error(`Erro ao listar usuários: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: err.message });
  }
}

async function addUser(req, res) {
  try {
    const { name, email } = req.body;
    const newUser = await User.createUser(name, email);

    // Log do novo usuário adicionado
    logger.info(`Novo usuário adicionado: ${name} (${email})`);

    res.json(newUser);
  } catch (err) {
    // Log do erro
    logger.error(`Erro ao adicionar usuário: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listUsers, addUser };