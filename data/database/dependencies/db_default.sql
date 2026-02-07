-- SELECT * FROM tbl_observacao_tipo
DROP RULE IF EXISTS iod_tbl_observacao_tipo ON tbl_observacao_tipo;

DELETE FROM tbl_observacao_tipo;
INSERT INTO tbl_observacao_tipo (id_observacao_tipo, ds_observacao_tipo)
  VALUES ('00000000-0000-0000-0000-000000000000', 'PRINCIPAL');

CREATE RULE iod_tbl_observacao_tipo
AS ON DELETE TO public.tbl_observacao_tipo
DO INSTEAD NOTHING;

-- SELECT * FROM tbl_pessoa_grupo
DROP RULE IF EXISTS iod_tbl_pessoa_grupo ON tbl_pessoa_grupo;

DELETE FROM tbl_pessoa_grupo;
INSERT INTO tbl_pessoa_grupo (id_pessoa_grupo, ds_pessoa_grupo)
  VALUES ('00000000-0000-0000-0000-000000000000', 'NÃO DEFINIDO');

CREATE RULE iod_tbl_pessoa_grupo 
AS ON DELETE TO public.tbl_pessoa_grupo
DO INSTEAD NOTHING;

-- SELECT * FROM tbl_pessoa_segmento
DROP RULE IF EXISTS iod_tbl_pessoa_segmento ON tbl_pessoa_segmento;

DELETE FROM tbl_pessoa_segmento;
INSERT INTO tbl_pessoa_segmento (id_pessoa_segmento, ds_pessoa_segmento)
  VALUES ('00000000-0000-0000-0000-000000000000', 'NÃO DEFINIDO');

CREATE RULE iod_tbl_pessoa_segmento 
AS ON DELETE TO public.tbl_pessoa_segmento
DO INSTEAD NOTHING;

--SELECT * FROM tbl_perfil
DROP RULE IF EXISTS iod_tbl_perfil ON tbl_perfil;

DELETE FROM tbl_perfil;
INSERT INTO tbl_perfil (id_perfil, no_perfil)
		 VALUES ('00000000-0000-0000-0000-000000000000', 'ADMINISTRADOR');

CREATE RULE iod_tbl_perfil
AS ON DELETE TO public.tbl_perfil
DO INSTEAD NOTHING;

--SELECT * FROM tbl_pessoa;
DROP RULE IF EXISTS iod_tbl_pessoa ON tbl_pessoa;

DELETE FROM tbl_pessoa;
INSERT INTO tbl_pessoa (id_pessoa, cd_pessoa, sg_pessoa_tipo, no_razao_social, no_fantasia, sg_pessoa)
  VALUES ('00000000-0000-0000-0000-000000000000', 1, 'PF', 'MASTER', 'MASTER', 'MASTER');

CREATE RULE iod_tbl_pessoa
AS ON DELETE TO public.tbl_pessoa
DO INSTEAD NOTHING;

--SELECT * FROM tbl_pessoa_juridica
DROP RULE IF EXISTS iod_tbl_pessoa_juridica ON tbl_pessoa_juridica;

DELETE FROM tbl_pessoa_juridica;
INSERT INTO tbl_pessoa_juridica (id_pessoa, cd_cnae, cd_natureza_juridica, cd_regime_tributario, cd_fiscal_atividade, sg_fiscal_perfil)
		 VALUES ('00000000-0000-0000-0000-000000000000', '62.02-3/00', '206-2', 1, 1, 'C');
		 
CREATE RULE iod_tbl_pessoa_juridica
AS ON DELETE TO public.tbl_pessoa_juridica
DO INSTEAD NOTHING;

--SELECT * FROM tbl_pessoa_fisica;
DROP RULE IF EXISTS iod_tbl_pessoa_fisica ON tbl_pessoa_fisica;

DELETE FROM tbl_pessoa_fisica;
INSERT INTO tbl_pessoa_fisica (id_pessoa)
  VALUES ('00000000-0000-0000-0000-000000000000');

CREATE RULE iod_tbl_pessoa_fisica
AS ON DELETE TO public.tbl_pessoa_fisica
DO INSTEAD NOTHING;

--SELECT * FROM tbl_pessoa_telefone;
DROP RULE IF EXISTS iod_tbl_pessoa_telefone ON tbl_pessoa_telefone;

DELETE FROM tbl_pessoa_telefone;
INSERT INTO tbl_pessoa_telefone (id_pessoa_telefone, id_pessoa, nu_telefone)
  VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '(00)00000-0000');

CREATE RULE iod_tbl_pessoa_telefone
AS ON DELETE TO public.tbl_pessoa_telefone
DO INSTEAD NOTHING;

--SELECT * FROM tbl_pessoa_endereco;
DROP RULE IF EXISTS iod_tbl_pessoa_endereco ON tbl_pessoa_endereco;

DELETE FROM tbl_pessoa_endereco;
INSERT INTO tbl_pessoa_endereco (id_pessoa_endereco, id_pessoa, sg_estado, cd_cidade, ds_cidade, cd_ibge, is_bairro, cd_bairro, ds_bairro, is_endereco, ds_endereco, nu_endereco, nu_cep, nu_latitude, nu_longitude)
  VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'PA', 4565, 'BELÉM', 1501402, false, 6692, 'ATALAIA', false, 'RODOVIA BR-316 - DO KM 0,899 AO KM 1,999 - LADO ÍMPAR', '1762', '67013-000', -1.39679950, -48.42341150);

CREATE RULE iod_tbl_pessoa_endereco
AS ON DELETE TO public.tbl_pessoa_endereco
DO INSTEAD NOTHING;

--SELECT * FROM tbl_usuario;
DROP RULE IF EXISTS iod_tbl_usuario ON tbl_usuario;

DELETE FROM tbl_usuario;
INSERT INTO tbl_usuario (cd_usuario, id_pessoa)
  VALUES (1, '00000000-0000-0000-0000-000000000000');

CREATE RULE iod_tbl_usuario
AS ON DELETE TO public.tbl_usuario
DO INSTEAD NOTHING;

--SELECT * FROM tbl_usuario_perfil;
DROP RULE IF EXISTS iod_tbl_usuario_perfil ON tbl_usuario_perfil;

DELETE FROM tbl_usuario_perfil;
INSERT INTO tbl_usuario_perfil (cd_usuario, id_perfil)
		 VALUES (1, '00000000-0000-0000-0000-000000000000');

CREATE RULE iod_tbl_usuario_perfil
AS ON DELETE TO public.tbl_usuario_perfil
DO INSTEAD NOTHING;

--SELECT * FROM tbl_usuario_sessao;
DROP RULE IF EXISTS iod_tbl_usuario_sessao ON tbl_usuario_sessao;

DELETE FROM tbl_usuario_sessao;
INSERT INTO tbl_usuario_sessao (nu_sessao, cd_usuario, no_computador, nu_ip)
		 VALUES ('00000000-0000-0000-0000-000000000000', 1, 'MASTER', '0.0.0.0');

CREATE RULE iod_tbl_usuario_sessao
AS ON DELETE TO public.tbl_usuario_sessao
DO INSTEAD NOTHING;

/*
--SELECT * FROM tbl_cofins_classe;
DROP RULE IF EXISTS iod_tbl_cofins_classe ON tbl_cofins_classe;

DELETE FROM tbl_cofins_classe;
INSERT INTO tbl_cofins_classe (id_cofins_classe, cd_entrada_saida, ds_cofins_classe)
  VALUES ('00000000-0000-0000-0000-000000000000', 0, 'ENTRADA PRINCIPAL')
        ,('11111111-1111-1111-1111-111111111111', 1, 'SAÍDA PRINCIPAL');

CREATE RULE iod_tbl_cofins_classe
AS ON DELETE TO public.tbl_cofins_classe
DO INSTEAD NOTHING;

--SELECT * FROM tbl_icms_classe;
DROP RULE IF EXISTS iod_tbl_icms_classe ON tbl_icms_classe;

DELETE FROM tbl_icms_classe;
INSERT INTO tbl_icms_classe (id_icms_classe, cd_entrada_saida, ds_icms_classe)
  VALUES ('00000000-0000-0000-0000-000000000000', 0, 'ENTRADA PRINCIPAL')
        ,('11111111-1111-1111-1111-111111111111', 1, 'SAÍDA PRINCIPAL');

CREATE RULE iod_tbl_icms_classe
AS ON DELETE TO public.tbl_icms_classe
DO INSTEAD NOTHING;

--SELECT * FROM tbl_ipi_classe;
DROP RULE IF EXISTS iod_tbl_ipi_classe ON tbl_ipi_classe;

DELETE FROM tbl_ipi_classe;
INSERT INTO tbl_ipi_classe (id_ipi_classe, cd_entrada_saida, ds_ipi_classe)
  VALUES ('00000000-0000-0000-0000-000000000000', 0, 'ENTRADA PRINCIPAL')
        ,('11111111-1111-1111-1111-111111111111', 1, 'SAÍDA PRINCIPAL');

CREATE RULE iod_tbl_ipi_classe
AS ON DELETE TO public.tbl_ipi_classe
DO INSTEAD NOTHING;

-- SELECT * FROM tbl_operacao
DROP RULE IF EXISTS iod_tbl_operacao ON tbl_operacao;

DELETE FROM tbl_operacao;
INSERT INTO tbl_operacao (id_operacao, cd_entrada_saida, ds_operacao, is_estoque, is_financeiro, is_suframa, is_comodato, is_ativo)
  VALUES ('00000000-0000-0000-0000-000000000000', 0, 'ENTRADA PRINCIPAL', true, true, false, false, true)
        ,('11111111-1111-1111-1111-111111111111', 1, 'SAÍDA PRINCIPAL', true, true, false, false, true);

CREATE RULE iod_tbl_operacao
AS ON DELETE TO public.tbl_operacao
DO INSTEAD NOTHING;

-- SELECT * FROM tbl_perfil_tributario
DROP RULE IF EXISTS iod_tbl_perfil_tributario ON tbl_perfil_tributario;

DELETE FROM tbl_perfil_tributario;
INSERT INTO tbl_perfil_tributario (id_perfil_tributario, ds_perfil_tributario)
  VALUES ('00000000-0000-0000-0000-000000000000', 'PJ REGIME NORMAL')
        ,('11111111-1111-1111-1111-111111111111', 'PJ SIMPLES NACIONAL')
        ,('22222222-2222-2222-2222-222222222222', 'PJ SUFRAMA')
        ,('33333333-3333-3333-3333-333333333333', 'CONSUMIDOR FINAL')
        ,('44444444-4444-4444-4444-444444444444', 'PRODUTOR RURAL');

CREATE RULE iod_tbl_perfil_tributario
AS ON DELETE TO public.tbl_perfil_tributario
DO INSTEAD NOTHING;

--SELECT * FROM tbl_pis_classe;
DROP RULE IF EXISTS iod_tbl_pis_classe ON tbl_pis_classe;

DELETE FROM tbl_pis_classe;
INSERT INTO tbl_pis_classe (id_pis_classe, cd_entrada_saida, ds_pis_classe)
  VALUES ('00000000-0000-0000-0000-000000000000', 0, 'ENTRADA PRINCIPAL')
        ,('11111111-1111-1111-1111-111111111111', 1, 'SAÍDA PRINCIPAL');

CREATE RULE iod_tbl_pis_classe
AS ON DELETE TO public.tbl_pis_classe
DO INSTEAD NOTHING;

--SELECT * FROM tbl_nivel_credito;
DROP RULE IF EXISTS iod_tbl_nivel_credito ON tbl_nivel_credito;

DELETE FROM tbl_nivel_credito;
INSERT INTO tbl_nivel_credito (id_nivel_credito, ds_nivel_credito)
  VALUES ('00000000-0000-0000-0000-000000000000', 'PRINCIPAL')

CREATE RULE iod_tbl_nivel_credito
AS ON DELETE TO public.tbl_nivel_credito
DO INSTEAD NOTHING;

--SELECT * FROM tbl_nivel_credito_gerencia;
DROP RULE IF EXISTS iod_tbl_nivel_credito_gerencia ON tbl_nivel_credito_gerencia;

DELETE FROM tbl_nivel_credito_gerencia;
INSERT INTO tbl_nivel_credito_gerencia (id_nivel_credito, cd_gerencia_motivo, is_autorizacao)
  SELECT '00000000-0000-0000-0000-000000000000'
			  ,A.cd_gerencia_motivo
				,false
	  FROM tbl_gerencia_motivo A

CREATE RULE iod_tbl_nivel_credito_gerencia
AS ON DELETE TO public.tbl_nivel_credito_gerencia
DO INSTEAD NOTHING;

--SELECT * FROM tbl_nomenclatura;
DROP RULE IF EXISTS iod_tbl_nomenclatura ON tbl_nomenclatura;

DELETE FROM tbl_nomenclatura;
INSERT INTO tbl_nomenclatura (id_nomenclatura, no_nomenclatura)
  SELECT '00000000-0000-0000-0000-000000000000'
			  ,'PRINCIPAL'

CREATE RULE iod_tbl_nomenclatura
AS ON DELETE TO public.tbl_nomenclatura
DO INSTEAD NOTHING;

--SELECT * FROM tbl_nomenclatura_ordem;
DROP RULE IF EXISTS iod_tbl_nomenclatura_ordem ON tbl_nomenclatura_ordem;

DELETE FROM tbl_nomenclatura_ordem;
INSERT INTO tbl_nomenclatura_ordem (id_nomenclatura, cd_campo, cd_ordem)
		 VALUES ('00000000-0000-0000-0000-000000000000', 1, 1)
					 ,('00000000-0000-0000-0000-000000000000', 5, 2)
					 ,('00000000-0000-0000-0000-000000000000', 2, 3)
					 ,('00000000-0000-0000-0000-000000000000', 4, 4)
					 ,('00000000-0000-0000-0000-000000000000', 3, 5)

CREATE RULE iod_tbl_nomenclatura_ordem
AS ON DELETE TO public.tbl_nomenclatura_ordem
DO INSTEAD NOTHING;

DROP RULE IF EXISTS iod_tbl_pessoa_tipo ON tbl_pessoa_tipo;
*/
