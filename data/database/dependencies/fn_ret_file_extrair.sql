CREATE OR REPLACE FUNCTION fn_ret_file_extrair (
 p_no_arquivo			                VARCHAR(8000)
,p_is_diretorio		                    BOOL
)
RETURNS VARCHAR(8000) AS $$

DECLARE
    v_nu_posicao                            SMALLINT        := 0;
    v_gn_auxiliar                           VARCHAR(8000)   := p_no_arquivo;
    v_gn_diretorio                          VARCHAR(8000)   := '';
    v_ic_diretorio                          CHAR(1)         := CASE WHEN STRPOS(p_no_arquivo, '\') > 0  THEN '\'
                                                                    WHEN STRPOS(p_no_arquivo, '/') > 0  THEN '/'
                                                                    ELSE ''
                                                                END;

BEGIN

----------------------------------------------------------------------------------------------------
-- PROCESSA ARQUIVO
----------------------------------------------------------------------------------------------------
    IF v_ic_diretorio = '' THEN
        IF p_is_diretorio THEN
            v_gn_auxiliar = '';
        END IF;
    ELSE
        v_nu_posicao  = STRPOS(v_gn_auxiliar, v_ic_diretorio);
        WHILE v_nu_posicao <> 0 LOOP
            v_gn_diretorio = v_gn_diretorio || LEFT(v_gn_auxiliar, v_nu_posicao);
            v_gn_auxiliar  = RIGHT(v_gn_auxiliar, LENGTH(v_gn_auxiliar) - v_nu_posicao);
            v_nu_posicao   = STRPOS(v_gn_auxiliar, v_ic_diretorio);
        END LOOP;
        IF p_is_diretorio THEN 
            v_gn_auxiliar = v_gn_diretorio;
        END IF;
    END IF;
    
--------------------------------------------------
-- RETORNO
--------------------------------------------------
	RETURN v_gn_auxiliar;
END;
$$ LANGUAGE plpgsql;