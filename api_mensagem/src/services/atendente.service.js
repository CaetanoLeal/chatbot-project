//src/services/atendente.service.js
const AtendenteRepository = require("../repositories/atendente.repository");

class AtendenteService {
  async cadastrarAtendente(dados) {
    // Regra: Um setor só pode ter uma IA atendente
    if (dados.is_ia && Array.isArray(dados.id_setor)) {
      for (const idSetor of dados.id_setor) {
        const iaJaExiste = await AtendenteRepository.verificarIaNoSetor(idSetor);

        if (iaJaExiste) {
          throw new Error(
            "Um dos setores selecionados já possui um atendente IA cadastrado."
          );
        }
      }
    }

    return await AtendenteRepository.criar(dados);
  }

  async obterAtendentes() {
    return await AtendenteRepository.listarTodos();
  }

  async atualizarAtendente(id, dados) {
    // Enquanto o repository retorna apenas true/false,
    // não é possível saber se a IA encontrada é o próprio atendente.
    // Portanto, a validação é aplicada apenas aos setores informados.
  if (dados.is_ia && Array.isArray(dados.id_setor)) {
    for (const idSetor of dados.id_setor) {
      const iaJaExiste = await AtendenteRepository.verificarIaNoSetor(idSetor, id); // <-- passa o id

      if (iaJaExiste) {
        throw new Error(
          "Um dos setores selecionados já possui um atendente IA cadastrado."
        );
      }
    }

  return await AtendenteRepository.atualizar(id, dados);
}

    return await AtendenteRepository.atualizar(id, dados);
  }

  async excluirAtendente(id) {
    const excluido = await AtendenteRepository.excluir(id);

    if (!excluido) {
      throw new Error("Atendente não encontrado.");
    }

    return true;
  }
}

module.exports = new AtendenteService();