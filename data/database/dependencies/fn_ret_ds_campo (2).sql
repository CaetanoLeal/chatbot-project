CREATE OR REPLACE FUNCTION fn_ret_ds_campo (
 p_no_tabela			                VARCHAR(1000)
,p_no_campo			                    VARCHAR(100)
)
RETURNS VARCHAR(200) AS $$

DECLARE
    v_ds_campo                              VARCHAR(200)    := '';

BEGIN

----------------------------------------------------------------------------------------------------
-- MONTANDO STRING
----------------------------------------------------------------------------------------------------
	v_ds_campo	= COALESCE((SELECT A.descricao
	                          FROM fr_dicionario_vi A
	                         WHERE A.tabela     = p_no_tabela
	                           AND A.campo      = p_no_campo)
	                      ,CASE p_no_campo
	                            WHEN 'dh_inclusao'      THEN 'Data/Hora Inclusão'
	                            WHEN 'dh_alteracao'     THEN 'Data/Hora Alteração'
	                            WHEN 'dh_exclusao'      THEN 'Data/Hora Exclusão'
	                            ELSE 
	                                CASE LEFT(p_no_campo, 2)
	                                     WHEN 'id'      THEN 'ID'
	                                     WHEN 'cd'      THEN 'Código'
	                                     WHEN 'no'      THEN 'Nome'
	                                     WHEN 'sg'      THEN 'Sigla'
	                                     WHEN 'ds'      THEN 'Descrição'
	                                     WHEN 'nu'      THEN 'Número'
                                         WHEN 'qt'	    THEN 'Quantidade'
                                         WHEN 'vl'	    THEN 'Valor'
                                         WHEN 'pe'	    THEN 'Percentual'
                                         WHEN 'md'	    THEN 'Média'
                                         WHEN 'dt'	    THEN 'Data'
                                         WHEN 'dh'	    THEN 'Data/Hora'
                                         WHEN 'hr'	    THEN 'Hora'
                                         WHEN 'is'	    THEN 'Lógico'
                                         WHEN 'in'	    THEN 'Id Numérico'
                                         WHEN 'ic'	    THEN 'Id Caractere'
                                         WHEN 'im'	    THEN 'Imagem'
                                         WHEN 'gn'	    THEN 'Genérico'
                                         ELSE ''		
                                     END || ' ' || SUBSTRING(REPLACE(p_no_campo, '_', ' '), 4, LENGTH(p_no_campo))
                            END

	);

--------------------------------------------------
-- RETORNA NUMÉRICO
--------------------------------------------------
	RETURN v_ds_campo;
END;
$$ LANGUAGE plpgsql;