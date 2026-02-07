CREATE OR REPLACE FUNCTION fn_ret_space (
 p_gn_string			            	    TEXT
,p_gn_caractere		                  TEXT
,p_nu_tamanho		                    INTEGER
,p_is_esquerda		                  BOOL
)
RETURNS TEXT AS $$

BEGIN

----------------------------------------------------------------------------------------------------
--  MONTA STRING
----------------------------------------------------------------------------------------------------
    IF (p_is_esquerda) THEN
        p_gn_string = LEFT(p_gn_string || REPEAT(p_gn_caractere, p_nu_tamanho), p_nu_tamanho);
    ELSE
        p_gn_string = RIGHT(REPEAT(p_gn_caractere, p_nu_tamanho) || p_gn_string, p_nu_tamanho);
    END IF;

----------------------------------------------------------------------------------------------------
--  RETORNO
----------------------------------------------------------------------------------------------------
	RETURN p_gn_string;
END;
$$ LANGUAGE plpgsql;