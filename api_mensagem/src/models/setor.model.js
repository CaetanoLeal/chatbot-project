//src/models/setor.model.js
"use strict";

const repository = require("../repositories/setor.repository");

class SetorModel {

  async listar() {
    return repository.listar();
  }

  async buscarPorId(idSetor) {
    return repository.buscarPorId(idSetor);
  }

  async inserir(dados, client = null) {
    return repository.inserir(dados, client);
  }

  async atualizar(idSetor, dados, client = null) {
    return repository.atualizar(idSetor, dados, client);
  }

  async excluir(idSetor, client = null) {
    return repository.excluir(idSetor, client);
  }

  async listarHorarios(idSetor) {
    return repository.listarHorarios(idSetor);
  }

  async inserirHorario(dados, client = null) {
    return repository.inserirHorario(dados, client);
  }

  async atualizarHorario(idHorario, dados, client = null) {
    return repository.atualizarHorario(idHorario, dados, client);
  }

  async excluirHorario(idHorario, client = null) {
    return repository.excluirHorario(idHorario, client);
  }

  async buscarConflitoHorario(
    idSetor,
    diaSemana,
    horaInicial,
    horaFinal,
    idHorario = null,
    client = null
  ) {
    return repository.buscarConflitoHorario(
      idSetor,
      diaSemana,
      horaInicial,
      horaFinal,
      idHorario,
      client
    );
  }

}

module.exports = new SetorModel();