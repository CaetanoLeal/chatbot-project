CREATE OR REPLACE FUNCTION fn_ret_numero_emb (
 p_nu_embalagem											NUMERIC(20,10)
)
RETURNS VARCHAR(20) AS $$

DECLARE
 v_pos_i														SMALLINT				:= LENGHT(CAST(p_nu_embalagem AS VARCHAR(20)));
 v_pos_j														SMALLINT				:= 1;
 v_atual														CHAR(1)					:= ' ';
 v_embalagem												VARCHAR(20)			:= CAST(p_nu_embalagem AS VARCHAR(20));
 v_return														VARCHAR(20)			:= '';

BEGIN
--------------------------------------------------------------------------------------------------------------
--	AJUSTES
--------------------------------------------------------------------------------------------------------------
	WHILE (v_pos_j <= v_pos_i) LOOP
		v_atual = SUBSTRING(v_embalagem, v_pos_j, 1);
		IF (v_atual IN ('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ',', '-')) THEN
			v_return = v_return || v_atual;
		END IF;
		v_pos_j = v_pos_j + 1;
	END LOOP;
	
--------------------------------------------------------------------------------------------------------------
--	FORMATANDO VALOR
--------------------------------------------------------------------------------------------------------------
	v_return = REPLACE(v_return, '.', ',');
	v_return = CASE WHEN LEFT(v_return, 1) = ',' THEN '0' ELSE '' END || v_return;
	WHILE (RIGHT(v_return, 1) = '0') LOOP
		v_return = LEFT(v_return, LENGTH(v_return) - 1);
	END LOOP;
	IF RIGHT(v_return, 1) = ',' THEN
		v_return = LEFT(v_return, LEN(v_return) - 1);
	END IF;
	
--------------------------------------------------------------------------------------------------------------
--	RETORNO
--------------------------------------------------------------------------------------------------------------
	RETURN v_return;
END;
$$ LANGUAGE plpgsql;