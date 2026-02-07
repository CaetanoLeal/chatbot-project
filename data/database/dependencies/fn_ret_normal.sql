CREATE OR REPLACE FUNCTION fn_ret_normal (
 p_gn_string														TEXT
,p_is_acento		                    		BOOL
) RETURNS TEXT AS $$

DECLARE
    v_pos_i                                 SMALLINT        := LENGTH(p_gn_string);
    v_pos_j                                 SMALLINT        := 1;
    v_atual                                 SMALLINT        := 0;
    v_return                                TEXT					  := '';

BEGIN

----------------------------------------------------------------------------------------------------
--  AJUSTES
----------------------------------------------------------------------------------------------------
    p_gn_string = LTRIM(RTRIM(p_gn_string));
    
----------------------------------------------------------------------------------------------------
--  PROCESSA ARQUIVO
----------------------------------------------------------------------------------------------------
    WHILE (v_pos_j <= v_pos_i) LOOP
        v_atual = ASCII(SUBSTRING(p_gn_string, v_pos_j, 1));
	-- CARACTERES NÃO IMPRIMÍVEIS
		IF (v_atual IN (208,240)) OR (v_atual BETWEEN 0 AND 31) OR (v_atual BETWEEN 127 AND 191) OR (v_atual BETWEEN 215 AND 216) OR (v_atual BETWEEN 221 AND 223) OR (v_atual BETWEEN 247 AND 248) OR (v_atual BETWEEN 253 AND 225) THEN
			v_return = v_return || ' ';
	-- DELETE
		ELSEIF v_atual = 127 THEN
			v_return = v_return || ' ';
	-- %
		ELSEIF v_atual = 37 THEN
			v_return = v_return || ' ';
		ELSE
        -- NÃO PERMITE ACENTOS
			IF NOT p_is_acento THEN
				IF v_atual BETWEEN 192 AND 198 THEN
					v_return = v_return || 'A';
				ELSEIF (v_atual BETWEEN 200 AND 203) OR (v_atual = 38) THEN
					v_return = v_return || 'E';
				ELSEIF v_atual BETWEEN 204 AND 207 THEN
					v_return = v_return || 'I';
				ELSEIF v_atual BETWEEN 210 AND 214 THEN
					v_return = v_return || 'O';
				ELSEIF v_atual BETWEEN 217 AND 220 THEN
					v_return = v_return || 'U';
				ELSEIF v_atual BETWEEN 224 AND 230 THEN
					v_return = v_return || 'a';
				ELSEIF v_atual BETWEEN 232 AND 235 THEN
					v_return = v_return || 'e';
				ELSEIF v_atual BETWEEN 236 AND 239 THEN
					v_return = v_return || 'i';
				ELSEIF v_atual BETWEEN 242 AND 246 THEN
					v_return = v_return || 'o';
				ELSEIF v_atual BETWEEN 249 AND 252 THEN
					v_return = v_return || 'u';
				ELSEIF v_atual = 199 THEN
					v_return = v_return || 'C';
				ELSEIF v_atual = 209 THEN
					v_return = v_return || 'N';
				ELSEIF v_atual = 231 THEN
					v_return = v_return || 'c';
				ELSEIF v_atual = 241 THEN
					v_return = v_return || 'n';
				ELSEIF v_atual IN (34,37,39,94,96,126) THEN
					v_return = v_return || ' ';
				ELSE
					v_return = v_return || CHR(v_atual);
				END IF;
			ELSE
				-- '
				IF v_atual = 39 THEN
					v_return = v_return || '`';
				ELSE
					v_return = v_return || CHR(v_atual);
				END IF;
			END IF;
		END IF;
		v_pos_j = v_pos_j + 1;
    END LOOP;

----------------------------------------------------------------------------------------------------
--  RETORNO
----------------------------------------------------------------------------------------------------
	v_atual = 1;
	WHILE (v_atual = 1) LOOP
		v_return = REPLACE(RTRIM(LTRIM(v_return)), '  ', ' ');
		IF NOT EXISTS(SELECT v_return WHERE v_return LIKE '%  %') THEN
			v_atual = 0;
		END IF;
	END LOOP;

----------------------------------------------------------------------------------------------------
--  RETORNO
----------------------------------------------------------------------------------------------------
	RETURN v_return;
END;
$$ LANGUAGE plpgsql;