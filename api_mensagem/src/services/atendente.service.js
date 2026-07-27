//src/services/atendente.service.js
const crypto = require('crypto');
const AtendenteRepository = require('../repositories/atendente.repository');

class AtendenteService {
  async cadastrarAtendente(dados) {
    // Regra: Um setor só pode ter uma IA atendente
    if (dados.is_ia) {
      const iaJaExiste = await AtendenteRepository.verificarIaNoSetor(dados.id_setor);
      if (iaJaExiste) {
        throw new Error('Este setor já possui um atendente IA cadastrado.');
      }
    }

    const id_atendente = crypto.randomUUID();
    
    const novoAtendente = {
      ...dados,
      id_atendente
    };

    return await AtendenteRepository.criar(novoAtendente);
  }

  async obterAtendentes() {
    return await AtendenteRepository.listarTodos();
  }

  async atualizarAtendente(id, dados) {
    if (dados.is_ia) {
      const iaJaExiste = await AtendenteRepository.verificarIaNoSetor(dados.id_setor);
      // Busca o atendente atual para saber se a IA que já existe é ele mesmo
      const atendentes = await AtendenteRepository.listarTodos();
      const atendenteAtual = atendentes.find(a => a.id_atendente === id);

      if (iaJaExiste && (!atendenteAtual || atendenteAtual.id_setor !== dados.id_setor || !atendenteAtual.is_ia)) {
        throw new Error('Este setor já possui um atendente IA cadastrado.');
      }
    }
    return await AtendenteRepository.atualizar(id, dados);
  }
  async excluirAtendente(id) {
    const excluido = await AtendenteRepository.excluir(id);
    
    if (!excluido) {
      throw new Error('Atendente não encontrado.');
    }
    
    return true;
  }
}

module.exports = new AtendenteService();