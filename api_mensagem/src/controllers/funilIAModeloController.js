// controllers/funilIAModeloController.js
const repository =
  require("../repositories/funilIAModeloRepository");

async function findAll(req, res) {

  try {

    const result = await repository.findAll();

    return res.json(result);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Erro ao listar modelos IA"
    });
  }
}

module.exports = {
  findAll
};