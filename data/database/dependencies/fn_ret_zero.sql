CREATE OR REPLACE FUNCTION fn_ret_zero (
 p_gn_string			                VARCHAR(8000)
,p_nu_tamanho			                INTEGER
)
RETURNS VARCHAR(8000) AS $$

BEGIN

----------------------------------------------------------------------------------------------------
-- MONTANDO STRING
----------------------------------------------------------------------------------------------------
	p_gn_string	= SUBSTRING(REPEAT('0', p_nu_tamanho) || p_gn_string, LENGTH(p_gn_string) + 1, p_nu_tamanho);

--------------------------------------------------
-- RETORNA NUMÉRICO
--------------------------------------------------
	RETURN p_gn_string;
END;
$$ LANGUAGE plpgsql;
