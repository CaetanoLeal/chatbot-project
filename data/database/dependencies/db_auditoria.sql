--------------------------------------------------------------------------------
--  CRIA SCHEMA PARA AUDITORIA
--------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS audit;

--------------------------------------------------------------------------------
--  CRIA TABELA PADRÃO PARA AUDITORIA
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit.aud_padrao (
 id_auditoria               CHAR(36)        NOT NULL DEFAULT uuid_generate_v4()
,dh_auditoria               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
,id_processo                INT             NOT NULL
,no_aplicacao               TEXT            NOT NULL
,no_cliente                 TEXT            NOT NULL
,gn_query                   TEXT            NOT NULL
,cd_acao                    SMALLINT        NOT NULL
);

--------------------------------------------------------------------------------
--  CRIA TABELA PARA REGISTRO DE AUDITORIA
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.aud_registro (
 nu_sessao                  CHAR(36)        NOT NULL
,id_sequencia               INT             NOT NULL
,id_auditoria               CHAR(36)        NOT NULL
,dh_inicial                 TIMESTAMP       NOT NULL
,dh_final                   TIMESTAMP       NOT NULL
,cd_acao                    SMALLINT        NOT NULL
,ds_acao                    VARCHAR(15)     NOT NULL
,no_usuario                 VARCHAR(20)     NOT NULL
,no_computador              VARCHAR(100)    NOT NULL
,nu_ip                      VARCHAR(128)    NOT NULL
,no_aplicacao               TEXT            NOT NULL
,no_cliente                 TEXT            NOT NULL
,gn_query                   TEXT            NOT NULL
,PRIMARY KEY (nu_sessao,id_sequencia)
);
 
--------------------------------------------------------------------------------
--  CRIA TABELA PARA DETALHAMENTO DE AUDITORIA
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.aud_detalhe (
 nu_sessao                  CHAR(36)        NOT NULL
,id_auditoria               CHAR(36)        NOT NULL
,no_campo                   VARCHAR(50)     NOT NULL
,ds_campo                   VARCHAR(100)    NOT NULL
,gn_antes                   VARCHAR(8000)   NOT NULL
,gn_depois                  VARCHAR(8000)   NOT NULL
,PRIMARY KEY (nu_sessao,id_auditoria,no_campo)
);
 
--------------------------------------------------------------------------------
--  FUNÇÕES PARA CONTROLE DE AUDITORIA
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION aud_inclusao() RETURNS SMALLINT AS $$
BEGIN
	RETURN 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION aud_alteracao() RETURNS SMALLINT AS $$
BEGIN
	RETURN 2;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION aud_exclusao() RETURNS SMALLINT AS $$
BEGIN
	RETURN 3;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION  aud_finalizacao() RETURNS SMALLINT AS $$
BEGIN
	RETURN 4;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION aud_autorizacao() RETURNS SMALLINT AS $$
BEGIN
	RETURN 5;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION aud_recuperacao() RETURNS SMALLINT AS $$
BEGIN
	RETURN 6;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION aud_login() RETURNS SMALLINT AS $$
BEGIN
	RETURN 7;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
--  FUNÇÕES PARA CRIAÇÃO DE TABELAS DE AUDITORIA
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.fn_auditoria_create(
 p_no_tabela                NAME
,p_is_drop                  BOOLEAN
) RETURNS BOOLEAN AS $$

DECLARE
    v_no_tabela_aud             NAME := 'audit.' || p_no_tabela || '_audit';

BEGIN

    --  DROP TABLE
    IF p_is_drop THEN
        EXECUTE 'DROP TABLE IF EXISTS ' || v_no_tabela_aud;
    END IF;

    --  CRIA TABELA DE AUDITORIA
    BEGIN
        EXECUTE 'CREATE TABLE ' || v_no_tabela_aud
             || ' AS (SELECT A.*, ' || (SELECT STRING_AGG('B.' || B1.no_campo || CASE WHEN B1.no_campo IN ('nu_sessao','dh_alteracao') THEN '' ELSE ', ' || B1.no_campo || ' AS ' || B1.no_campo || '_old' END, ', ' ORDER BY B1.cd_coluna ASC) AS no_campo
                                          FROM vw_sys_table B1
                                         WHERE B1.no_tabela      = '' || p_no_tabela ||''
                                           AND B1.no_campo       NOT IN ('cd_exporta'
                                                                        ,'dh_inclusao'
                                                                        ,'dh_exclusao'))
             || '       FROM audit.aud_padrao A CROSS JOIN ' || p_no_tabela || ' B LIMIT 0)';
    EXCEPTION
        WHEN duplicate_table THEN
    END;

    --  DROP TRIGGER
    EXECUTE 'DROP TRIGGER IF EXISTS trg_a_iud_audit ON ' || p_no_tabela || ' CASCADE';

    --  CREATE TRIGGER
    EXECUTE 'CREATE TRIGGER trg_a_iud_audit'
         || ' AFTER INSERT OR UPDATE OR DELETE ON ' || p_no_tabela || ' FOR EACH ROW '
         || 'EXECUTE PROCEDURE audit.fn_trg_a_iud_audit()';

    --  RETURN
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
--  FUNÇÕES PARA CRIAÇÃO DE TABELAS DE AUDITORIA
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.fn_trg_a_iud_audit() RETURNS TRIGGER AS $$

DECLARE
    v_no_tabela                 NAME        = TG_TABLE_NAME;
    v_no_tabela_audit           NAME        = 'audit.' || TG_TABLE_NAME || '_audit';
    v_id_auditoria              CHAR(36)    = uuid_generate_v4();
    v_dh_auditoria              TIMESTAMP   = CURRENT_TIMESTAMP;
    v_id_processo               INT         = pg_backend_pid();
    v_no_aplicacao              TEXT;
    v_no_cliente                TEXT;
    v_gn_query                  TEXT;
    v_cd_acao                   SMALLINT;
    v_tbl_new                   RECORD;
    v_tbl_old                   RECORD;
    v_is_excluido               BOOLEAN;
    v_is_finalizado             BOOLEAN;
    v_gn_campos                 TEXT;

BEGIN

    v_cd_acao       = CASE (substring(TG_OP, 1, 1))
                           WHEN 'I' THEN aud_inclusao()
                           WHEN 'U' THEN aud_alteracao()
                           ELSE aud_exclusao()
                       END;
--//    IF (v_cd_acao = aud_exclusao()) THEN
        v_tbl_old := COALESCE(OLD, NEW);
--//    ELSE
        v_tbl_new := COALESCE(NEW, OLD);
--//    END IF;

    v_gn_campos     = (SELECT STRING_AGG('$8.' || A.no_campo || CASE WHEN A.no_campo IN ('nu_sessao','dh_alteracao') THEN '' ELSE ', $9.' || A.no_campo || ' AS ' || A.no_campo || '_old' END, ', ' ORDER BY A.cd_coluna ASC) AS no_campo
                         FROM vw_sys_table A
                        WHERE A.no_tabela       = '' || v_no_tabela ||''
                          AND A.no_campo        NOT IN ('cd_exporta'
                                                       ,'dh_inclusao'
                                                       ,'dh_exclusao'));

    v_is_excluido   = COALESCE((SELECT true AS v_is_excluido
                                  FROM vw_sys_table A
                                 WHERE A.no_tabela      = '' || v_no_tabela || ''
                                   AND A.no_campo       = 'is_excluido')
                              , false);

    v_is_finalizado = COALESCE((SELECT true AS v_is_finalizado
                                  FROM vw_sys_table A
                                 WHERE A.no_tabela      = '' || v_no_tabela || ''
                                   AND A.no_campo       = 'is_finalizado')
                              , false);

    IF v_cd_acao = aud_alteracao() THEN
        IF v_is_excluido = true THEN
            IF ((OLD.is_excluido = false) AND (NEW.is_excluido = true)) THEN
                v_cd_acao = aud_exclusao();
            ELSEIF ((OLD.is_excluido = true) AND (NEW.is_excluido = false)) THEN
                v_cd_acao = aud_recuperacao();
            END IF;
        END IF;
        
        IF v_is_finalizado = true THEN
            IF ((OLD.is_finalizado = false) AND (NEW.is_finalizado = true)) THEN
                v_cd_acao = aud_finalizacao();
            END IF;
        END IF;
    END IF;
    
    SELECT A.application_name || ' (' || A.datname || '-' || A.usename || ')'
          ,COALESCE(A.client_hostname, CAST(A.client_addr AS VARCHAR), '') || ':' || A.client_port
          ,A.query
      INTO v_no_aplicacao
          ,v_no_cliente
          ,v_gn_query
      FROM pg_stat_activity A
     WHERE A.pid            = v_id_processo;
    
    EXECUTE 'INSERT INTO ' || v_no_tabela_audit || ' '
         || '     SELECT $1, $2, $3, $4, $5, $6, $7, ' || v_gn_campos 
      USING v_id_auditoria, v_dh_auditoria, v_id_processo, v_no_aplicacao, v_no_cliente, v_gn_query, v_cd_acao, v_tbl_new, v_tbl_old;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
--  FUNÇÕES PARA RETORNAR AÇÃO
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_ret_acao(
 p_cd_acao                  SMALLINT
) RETURNS VARCHAR(15) AS $$

DECLARE
    v_return                    VARCHAR(15)     := CASE p_cd_acao
                                                        WHEN aud_inclusao()     THEN 'INCLUSÃO'
                                                        WHEN aud_alteracao()    THEN 'ALTERAÇÃO'
                                                        WHEN aud_exclusao()     THEN 'EXCLUSÃO'
                                                        WHEN aud_finalizacao()  THEN 'FINALIZAÇÃO'
                                                        WHEN aud_autorizacao()  THEN 'AUTORIZAÇÃO'
                                                        WHEN aud_recuperacao()  THEN 'RECUPERAÇÃO'
                                                        WHEN aud_login()        THEN 'LOGIN'
                                                        ELSE 'NÃO DEFINIDO'
                                                    END;

BEGIN
    --  RETURN
    RETURN v_return;
END;
$$ LANGUAGE plpgsql;


--------------------------------------------------------------------------------
--  FUNÇÕES PARA TRIGGER fr_usuario
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_trg_a_i_fr_usuario() RETURNS TRIGGER AS $$

DECLARE
	v_sis_codigo							VARCHAR(3)		= 'ERP';

BEGIN
	-- OPERAÇÃO INSERT
	IF SUBSTRING(TG_OP, 1, 1) = 'I' THEN
	
		-- DEFINIR SERNHA '1234'
		UPDATE fr_usuario
			 SET usr_senha	= MD5(CAST(NEW.usr_codigo AS VARCHAR) || '1234')
		 WHERE usr_codigo	= NEW.usr_codigo;

		-- VERIFICA SE EXISTE fr_grupo
		IF NOT EXISTS(SELECT * FROM fr_grupo WHERE grp_codigo = 1 AND sis_codigo = v_sis_codigo) THEN
			INSERT INTO fr_grupo (grp_codigo, sis_codigo, grp_nome, grp_filtro_dicionario)
			  VALUES (1, v_sis_codigo, 'PRINCIPAL', '');
		END IF;
		
		-- INSERE fr_usuario_grupo
		INSERT INTO fr_usuario_grupo (grp_codigo, sis_codigo, usr_codigo)
			VALUES (1, v_sis_codigo, NEW.usr_codigo);
			
		-- INSERE fr_usuario_sistema
		INSERT INTO fr_usuario_sistema (usr_codigo, sis_codigo, uss_acesso_externo, uss_administrador, uss_acesso_maker, uss_criar_formulario, uss_criar_relatorio, uss_acessar, uss_criar_regra)
		  VALUES (NEW.usr_codigo, v_sis_codigo, 'N', 'N', 'N', 'N', 'N', 'S', 'N');
 
	END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


--------------------------------------------------------------------------------
--  CRIAR TRIGGER PARA fr_usuario
--------------------------------------------------------------------------------
--  DROP TRIGGER
DROP TRIGGER IF EXISTS trg_a_i_fr_usuario ON fr_usuario CASCADE;

--  CREATE TRIGGER
CREATE TRIGGER trg_a_i_fr_usuario
 AFTER INSERT ON fr_usuario FOR EACH ROW
			 EXECUTE PROCEDURE public.fn_trg_a_i_fr_usuario();


--------------------------------------------------------------------------------
--  CRIAR TRIGGER PARA AS TABELAS
--------------------------------------------------------------------------------
SELECT A.no_tabela, audit.fn_auditoria_create(A.no_tabela, true)
  FROM vw_sys_table A
 WHERE A.no_schema          = 'public'
   AND LEFT(A.no_tabela, 4) = 'tbl_'
   AND A.no_tabela     NOT IN ('tbl_usuario_sessao')
   AND A.no_campo           = 'nu_sessao'
 GROUP BY A.no_tabela
 ORDER BY A.no_tabela ASC;
