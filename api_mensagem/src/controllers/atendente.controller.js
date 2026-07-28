//src/controllers/atendente.controller.js
const AtendenteService = require("../services/atendente.service");

class AtendenteController {
  async criar(req, res) {
    try {
      const { id_setor, no_atendente, im_image, is_ia } = req.body;

      if (
        !Array.isArray(id_setor) ||
        id_setor.length === 0 ||
        !no_atendente
      ) {
        return res.status(400).json({
          error: "Pelo menos um setor e o nome do atendente são obrigatórios.",
        });
      }

      const atendente = await AtendenteService.cadastrarAtendente({
        id_setor,
        no_atendente,
        im_image,
        is_ia: Boolean(is_ia),
      });

      return res.status(201).json(atendente);
    } catch (error) {
      if (error.message.includes("já possui um atendente IA")) {
        return res.status(409).json({ error: error.message });
      }

      return res.status(500).json({
        error: "Erro interno ao cadastrar atendente.",
      });
    }
  }

  async listar(req, res) {
    try {
      const atendentes = await AtendenteService.obterAtendentes();
      return res.status(200).json(atendentes);
    } catch (error) {
      return res.status(500).json({
        error: "Erro interno ao buscar atendentes.",
      });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { id_setor, no_atendente, im_image, is_ia } = req.body;

      if (
        !Array.isArray(id_setor) ||
        id_setor.length === 0 ||
        !no_atendente
      ) {
        return res.status(400).json({
          error: "Pelo menos um setor e o nome do atendente são obrigatórios.",
        });
      }

      const atendente = await AtendenteService.atualizarAtendente(id, {
        id_setor,
        no_atendente,
        im_image,
        is_ia: Boolean(is_ia),
      });

      return res.status(200).json(atendente);
    } catch (error) {
      if (error.message.includes("já possui um atendente IA")) {
        return res.status(409).json({ error: error.message });
      }

      return res.status(500).json({
        error: "Erro interno ao atualizar atendente.",
      });
    }
  }

  async excluir(req, res) {
    try {
      const { id } = req.params;

      await AtendenteService.excluirAtendente(id);

      return res.status(200).json({
        message: "Atendente excluído com sucesso.",
      });
    } catch (error) {
      if (error.message === "Atendente não encontrado.") {
        return res.status(404).json({ error: error.message });
      }

      if (
        error.message.includes("foreign key") ||
        error.message.includes("vinculado")
      ) {
        return res.status(409).json({
          error:
            "Não é possível excluir o atendente, pois existem chats ou dados vinculados a ele.",
        });
      }

      return res.status(500).json({
        error: "Erro interno ao excluir atendente.",
      });
    }
  }
}

module.exports = new AtendenteController();