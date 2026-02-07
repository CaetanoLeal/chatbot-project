--SELECT fn_copy('OUT', '');
/*
DROP TABLE tbl_web_service_acao;
SELECT * FROM tbl_porte;
DELETE FROM tbl_porte WHERE cd_porte <> '01';
INSERT INTO tbl_porte (cd_porte, ds_porte)
  VALUES ('02', 'MICRO EMPRESA'), ('03', 'EMPRESA DE PEQUENO PORTE'), ('05', 'DEMAIS');
UPDATE tbl_pessoa_juridica SET cd_porte = '01'
UPDATE tbl_porte SET ds_porte = 'NÃO INFORMADO'
*/
--	SELECT fn_copy('IN', 'tbl_arma_fogo_tipo');
SELECT fn_copy('IN', 'tbl_arredondamento');
SELECT fn_copy('IN', 'tbl_banco');
SELECT fn_copy('IN', 'tbl_bairro');
SELECT fn_copy('IN', 'tbl_bairro_cep');
SELECT fn_copy('IN', 'tbl_cabecalho_pagina');
SELECT fn_copy('IN', 'tbl_cabecalho_tipo');
--	SELECT fn_copy('IN', 'tbl_caixa_status');
--	SELECT fn_copy('IN', 'tbl_cartao_tipo');
SELECT fn_copy('IN', 'tbl_cbo_atividade');
SELECT fn_copy('IN', 'tbl_cbo_familia');
SELECT fn_copy('IN', 'tbl_cbo_grande_area');
SELECT fn_copy('IN', 'tbl_cbo_grande_grupo');
SELECT fn_copy('IN', 'tbl_cbo_ocupacao');
SELECT fn_copy('IN', 'tbl_cbo_sub_grupo');
SELECT fn_copy('IN', 'tbl_cbo_sub_grupo_principal');
SELECT fn_copy('IN', 'tbl_cbo_titulo');
--	SELECT fn_copy('IN', 'tbl_cest_segmento');
--	SELECT fn_copy('IN', 'tbl_cest');
--	SELECT fn_copy('IN', 'tbl_cest_ncm');
--	SELECT fn_copy('IN', 'tbl_cfop_tipo');
--	SELECT fn_copy('IN', 'tbl_cfop_categoria');
--	SELECT fn_copy('IN', 'tbl_cfop');
--	SELECT fn_copy('IN', 'tbl_cheque_emissao');
--	SELECT fn_copy('IN', 'tbl_cheque_status');
SELECT fn_copy('IN', 'tbl_cidade');
--	SELECT fn_copy('IN', 'tbl_cnab');
SELECT fn_copy('IN', 'tbl_cnae_secao');
SELECT fn_copy('IN', 'tbl_cnae_divisao');
SELECT fn_copy('IN', 'tbl_cnae_grupo');
SELECT fn_copy('IN', 'tbl_cnae_classe');
SELECT fn_copy('IN', 'tbl_cnae');
SELECT fn_copy('IN', 'tbl_cnh_categoria');
SELECT fn_copy('IN', 'tbl_compromisso_tipo');
--	SELECT fn_copy('IN', 'tbl_cofins_cst');
SELECT fn_copy('IN', 'tbl_combustivel');
SELECT fn_copy('IN', 'tbl_conta_tipo');
--	SELECT fn_copy('IN', 'tbl_documento_icms');
--	SELECT fn_copy('IN', 'tbl_documento_iss');
--	SELECT fn_copy('IN', 'tbl_documento_situacao');
SELECT fn_copy('IN', 'tbl_endereco_tipo');
--	SELECT fn_copy('IN', 'tbl_entrada_saida');
SELECT fn_copy('IN', 'tbl_estado');
SELECT fn_copy('IN', 'tbl_estado_civil');
SELECT fn_copy('IN', 'tbl_etnia');
SELECT fn_copy('IN', 'tbl_feriado_status');
SELECT fn_copy('IN', 'tbl_feriado_tipo');
SELECT fn_copy('IN', 'tbl_fiscal_atividade');
SELECT fn_copy('IN', 'tbl_fiscal_industrial');
SELECT fn_copy('IN', 'tbl_fiscal_perfil');
SELECT fn_copy('IN', 'tbl_funcao');
SELECT fn_copy('IN', 'tbl_genero');
--	SELECT fn_copy('IN', 'tbl_gerencia_motivo');
--	SELECT fn_copy('IN', 'tbl_gerencia_tipo');
SELECT fn_copy('IN', 'tbl_grau_instrucao');
--	SELECT fn_copy('IN', 'tbl_ibpt');
--	SELECT fn_copy('IN', 'tbl_ibpt_tipo');
--	SELECT fn_copy('IN', 'tbl_ibpt_codigo');
--	SELECT fn_copy('IN', 'tbl_icms_bc_modalidade');
--	SELECT fn_copy('IN', 'tbl_icms_cst');
--	SELECT fn_copy('IN', 'tbl_icms_desoneracao_motivo');
--	SELECT fn_copy('IN', 'tbl_icms_origem');
--	SELECT fn_copy('IN', 'tbl_icms_st_bc_modalidade');
SELECT fn_copy('IN', 'tbl_ie_destinatario');
--	SELECT fn_copy('IN', 'tbl_ipi_cst');
SELECT fn_copy('IN', 'tbl_imagem_tipo');
--	SELECT fn_copy('IN', 'tbl_ipi_grupo');
--	SELECT fn_copy('IN', 'tbl_ipi_enquadramento');
--	SELECT fn_copy('IN', 'tbl_ipi_grupo_cst');
--	SELECT fn_copy('IN', 'tbl_lancamento_historico_campo');
--	SELECT fn_copy('IN', 'tbl_lancamento_natureza');
--	SELECT fn_copy('IN', 'tbl_lancamento_status');
--	SELECT fn_copy('IN', 'tbl_lancamento_tipo');
--	SELECT fn_copy('IN', 'tbl_lancamento_tipo_grupo');
--	SELECT fn_copy('IN', 'tbl_lc116_grupo');
--	SELECT fn_copy('IN', 'tbl_lc116');
SELECT fn_copy('IN', 'tbl_logradouro');
--	SELECT fn_copy('IN', 'tbl_medicamento_st');
--	SELECT fn_copy('IN', 'tbl_medicamento_tipo');
SELECT fn_copy('IN', 'tbl_mes');
SELECT fn_copy('IN', 'tbl_natureza_juridica_grupo');
SELECT fn_copy('IN', 'tbl_natureza_juridica');
--	SELECT fn_copy('IN', 'tbl_nbs_secao');
--	SELECT fn_copy('IN', 'tbl_nbs_capitulo');
--	SELECT fn_copy('IN', 'tbl_nbs');
--	SELECT fn_copy('IN', 'tbl_ncm_categoria');
--	SELECT fn_copy('IN', 'tbl_ncm');
--	SELECT fn_copy('IN', 'tbl_nomenclatura_campo');
SELECT fn_copy('IN', 'tbl_numeros');
--	SELECT fn_copy('IN', 'tbl_pagamento_especie');
--	SELECT fn_copy('IN', 'tbl_pagamento_tipo');
SELECT fn_copy('IN', 'tbl_pagina');
SELECT fn_copy('IN', 'tbl_pagina_orientacao');
SELECT fn_copy('IN', 'tbl_pais');
--	SELECT fn_copy('IN', 'tbl_pcp_maquina_status');
--	SELECT fn_copy('IN', 'tbl_pcp_recurso_humano_status');
--	SELECT fn_copy('IN', 'tbl_periodicidade');
SELECT fn_copy('IN', 'tbl_pessoa_tipo');
--	SELECT fn_copy('IN', 'tbl_pis_cst');
--	SELECT fn_copy('IN', 'tbl_plano_conta_tipo');
--	SELECT fn_copy('IN', 'tbl_plano_conta_natureza');
SELECT fn_copy('IN', 'tbl_porte');
--	SELECT fn_copy('IN', 'tbl_produto_tipo');
SELECT fn_copy('IN', 'tbl_regime_tributario');
--	SELECT fn_copy('IN', 'tbl_relatorio');
--	SELECT fn_copy('IN', 'tbl_relatorio_padrao');
SELECT fn_copy('IN', 'tbl_semana');
SELECT fn_copy('IN', 'tbl_socio_qualificacao');
--	SELECT fn_copy('IN', 'tbl_tesouraria_status');
SELECT fn_copy('IN', 'tbl_tipo_sanguineo');
--	SELECT fn_copy('IN', 'tbl_tributacao_calculo');
SELECT fn_copy('IN', 'tbl_veiculo_carroceria');
SELECT fn_copy('IN', 'tbl_veiculo_cor');
SELECT fn_copy('IN', 'tbl_veiculo_marca');
SELECT fn_copy('IN', 'tbl_veiculo_modelo');
SELECT fn_copy('IN', 'tbl_veiculo_propriedade');
SELECT fn_copy('IN', 'tbl_veiculo_rodado');
SELECT fn_copy('IN', 'tbl_veiculo_status');
SELECT fn_copy('IN', 'tbl_veiculo_tipo');
--	SELECT fn_copy('IN', 'tbl_web_service_tipo');

/*
-- tbl_relatorio_padrao
UPDATE tbl_relatorio_padrao
   SET id_relatorio = COALESCE((SELECT id_relatorio FROM tbl_relatorio WHERE tbl_relatorio.no_impressao = tbl_relatorio_padrao.no_impressao AND is_principal = true LIMIT 1), '')
 WHERE id_relatorio = '';
SELECT * FROM tbl_menu
SELECT * FROM fr_formulario
SELECT * FROM tbl_perfil_menu
*/
