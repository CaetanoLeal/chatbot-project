// src/controllers/funilIAController.js
const repository = require("../repositories/funilIARepository");

async function create(req, res) {
  try {
    const result = await repository.create(req.body);
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);

    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.message });
    }

    return res.status(500).json({ error: "Erro ao criar funil IA" });
  }
}

async function findAll(req, res) {
  try {
    const result = await repository.findAll();
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar funis IA" });
  }
}

async function findById(req, res) {
  try {
    const result = await repository.findById(req.params.id);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar funil IA" });
  }
}

async function update(req, res) {
  try {
    const result = await repository.update(req.params.id, req.body);
    return res.json(result);
  } catch (err) {
    console.error(err);

    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.message });
    }

    return res.status(500).json({ error: "Erro ao atualizar funil IA" });
  }
}

async function remove(req, res) {
  try {
    await repository.remove(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao remover funil IA" });
  }
}

async function findAllByFunil(req, res) {
  try {
    const result = await repository.findAllByFunil(req.params.idFunil);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar IAs do funil" });
  }
}

module.exports = {
  create,
  findAll,
  findAllByFunil,
  findById,
  update,
  remove,
};