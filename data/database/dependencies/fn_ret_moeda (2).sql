DROP FUNCTION IF EXISTS fn_ret_moeda(NUMERIC(30,10), INTEGER);

CREATE OR REPLACE FUNCTION fn_ret_moeda (
 p_vl_moeda			                    NUMERIC(50,10)
,p_qt_decimais                          INTEGER         = 2
)
RETURNS VARCHAR(50) AS $$

DECLARE
    v_pos_i                                 SMALLINT        := 0;
    v_pos_j                                 SMALLINT        := 1;
    v_atual                                 CHAR(1)         := ' ';
    v_moeda                                 VARCHAR(50)     := CAST(ROUND(p_vl_moeda, p_qt_decimais) AS VARCHAR(30));
    v_return                                VARCHAR(50)     := '';

BEGIN

----------------------------------------------------------------------------------------------------
--  AJUSTES
----------------------------------------------------------------------------------------------------
    v_pos_i = LENGTH(v_moeda);
	WHILE (v_pos_j <= v_pos_i) LOOP
		v_atual = SUBSTRING(v_moeda, v_pos_j, 1);
		IF (v_atual IN ('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ',', '-')) THEN
			v_return = v_return || v_atual;
		END IF;
		v_pos_j = v_pos_j + 1;
	END LOOP;
    
----------------------------------------------------------------------------------------------------
--  FORMATANDO VALOR
----------------------------------------------------------------------------------------------------
	v_return = REPLACE(v_return, '.', ',');
	WHILE (LEFT(v_return, 1) IN ('0', '.', '-')) LOOP
	    v_return = RIGHT(v_return, LENGTH(v_return) - 1);
	END LOOP;
	v_return = CASE WHEN LEFT(v_return, 1) = ',' THEN '0' ELSE '' END || v_return;
    v_pos_i = LENGTH(v_return) - p_qt_decimais - 1;
    IF (RIGHT(v_return, 1) = ',') THEN
		v_return = LEFT(v_return, LENGTH(v_return) - 1);
    END IF;
    IF (v_pos_i > 3) THEN
        v_moeda = LEFT(v_return, v_pos_i);
        v_return = RIGHT(v_return, p_qt_decimais + 1);
        WHILE (LENGTH(v_moeda) > 3) LOOP
            v_return = '.' || RIGHT(v_moeda, 3) || v_return;
            v_moeda = LEFT(v_moeda, LENGTH(v_moeda) - 3);
        END LOOP;
        v_return = v_moeda || v_return;
        IF (LEFT(v_return, 1)) = '.' THEN
            v_return = RIGHT(v_return, LENGTH(v_return) - 1);
        END IF;
    END IF;    
    v_return = CASE WHEN (p_vl_moeda < 0) THEN '-' ELSE '' END || v_return;

----------------------------------------------------------------------------------------------------
--  RETORNO
----------------------------------------------------------------------------------------------------
	RETURN v_return;
END;
$$ LANGUAGE plpgsql;