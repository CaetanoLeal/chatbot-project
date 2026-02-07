/*
SELECT fn_copy('IN', 'tbl_icms_desoneracao_motivo');
DROP FUNCTION fn_copy(VARCHAR, VARCHAR, VARCHAR, VARCHAR, BOOLEAN, VARCHAR, CHAR, CHAR, BOOLEAN)
*/
CREATE OR REPLACE FUNCTION fn_copy (
 p_ic_tipo								VARCHAR(4)
,p_no_tabela							VARCHAR(8000)
,p_gn_path								VARCHAR(100)    = ''
,p_no_file								VARCHAR(100)	= ''
,p_is_delete							BOOLEAN			= true
,p_no_schema                            VARCHAR(100)    = 'public'
,p_gn_tipo                              CHAR(1)         = ''
,p_ic_delimiter                         CHAR(1)         = '^'
,p_is_header                            BOOLEAN         = false
) RETURNS BOOLEAN AS $$

DECLARE
    v_cmd                                   VARCHAR(8000)   := '';
    v_aux                                   VARCHAR(100)    := '';

BEGIN

----------------------------------------------------------------------------------------------------
-- VALIDANDO
----------------------------------------------------------------------------------------------------
    IF (p_ic_tipo NOT IN ('IN', 'OUT')) THEN
        RAISE EXCEPTION 'O tipo de BCP deve ser "IN" ou "OUT".';
        RETURN false;
    END IF;
    
    IF (p_gn_tipo = '') THEN
        p_gn_tipo = 'T';
    END IF;
    
    IF (p_gn_tipo NOT IN ('C', 'T', 'B')) THEN
        RAISE EXCEPTION 'O tipo de BCP deve ser "IN" ou "OUT".';
        RETURN false;
    END IF;
    
    IF ((p_gn_tipo = 'C') AND (p_ic_delimiter = '')) THEN
        p_ic_delimiter = '^';
    END IF;
    
    IF NOT EXISTS(SELECT A.no_tabela FROM vw_sys_table A WHERE A.no_tabela = p_no_tabela) THEN
        RAISE EXCEPTION 'Tabela inexistente: "%".', p_no_tabela
        USING HINT = 'Verifique o nome da tabela';
        RETURN false;
    END IF;

----------------------------------------------------------------------------------------------------
--  AJUSTES
----------------------------------------------------------------------------------------------------
    IF (p_gn_path = '') THEN
        p_gn_path	= 'C:\database\copy\';
    END IF;
    
    IF (RIGHT(p_gn_path, 1) <> '\') THEN
        p_gn_path	= p_gn_path || '\';
    END IF;
    
    IF (p_no_file = '') THEN
        p_no_file	= p_gn_path || p_no_tabela || '.copy';
    END IF;
    
    IF (p_no_schema = '') THEN
        p_no_schema	= 'public';
    END IF;

----------------------------------------------------------------------------------------------------
--  CONFIGURA TRIGGER
----------------------------------------------------------------------------------------------------
    IF ((p_ic_tipo = 'IN') AND (p_is_delete = true)) THEN
        BEGIN
            EXECUTE FORMAT('ALTER TABLE %I.%I DISABLE TRIGGER ALL', p_no_schema, p_no_tabela);
        EXCEPTION
            WHEN duplicate_table THEN
                RAISE EXCEPTION 'Erro ao desativar trigger: "%".', p_no_tabela
                USING HINT = 'Desative-as manualmente';
                RETURN false;
        END;
        
        BEGIN
            EXECUTE FORMAT('DELETE FROM %s.%s', p_no_schema, p_no_tabela);
        EXCEPTION
            WHEN duplicate_table THEN
                RAISE EXCEPTION 'Erro ao excluir registros: "%".', p_no_tabela
                USING HINT = 'Verifique as restrições da tabela';
                RETURN false;
        END;
    END IF;

----------------------------------------------------------------------------------------------------
--  PROCESSA ARQUIVO
----------------------------------------------------------------------------------------------------
    BEGIN
        v_cmd   = CASE WHEN p_ic_tipo = 'IN' THEN 'FROM' ELSE 'TO' END;
    
        v_aux   = CASE WHEN p_gn_tipo = 'C' THEN ' WITH CSV'
                       WHEN p_gn_tipo = 'B' THEN ' WITH BINARY' 
                       ELSE '' 
                   END
               || CASE WHEN p_ic_delimiter = '' THEN '' ELSE FORMAT(' DELIMITER ''%s''', p_ic_delimiter) END
               || CASE WHEN p_is_header = true THEN ' HEADER' ELSE '' END;
    
        v_cmd   = FORMAT('COPY %s %s ''%s'' %s', p_no_tabela, v_cmd, p_no_file, v_aux);
    
        EXECUTE v_cmd;
    EXCEPTION
        WHEN duplicate_table THEN
    END;

----------------------------------------------------------------------------------------------------
--  RETORNA TRIGGER
----------------------------------------------------------------------------------------------------
    IF (p_ic_tipo = 'IN') AND (p_is_delete = true) THEN
        BEGIN
            EXECUTE FORMAT('ALTER TABLE %I.%I ENABLE TRIGGER ALL', p_no_schema, p_no_tabela);
        EXCEPTION
            WHEN duplicate_table THEN
                RAISE EXCEPTION 'Erro ao reativar trigger: "%".', p_no_tabela
                USING HINT = 'Ative-as manualmente';
                RETURN false;
        END;
    END IF;

----------------------------------------------------------------------------------------------------
--  RETORNO
----------------------------------------------------------------------------------------------------
	RETURN true;

END;
$$ LANGUAGE plpgsql;