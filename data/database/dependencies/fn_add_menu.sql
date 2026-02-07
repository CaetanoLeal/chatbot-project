CREATE OR REPLACE FUNCTION "public"."fn_add_menu"("p_cd_menu" int4, "p_frm_codigo" int4, "p_cd_menu_pai" int4, "p_no_menu" varchar, "p_is_ativo" bool=false, "p_gn_funcao" varchar=''::character varying)
  RETURNS "pg_catalog"."void" AS $BODY$

BEGIN
	--	INSERT ou UPDATE na tbl_menu
	INSERT INTO tbl_menu (cd_menu, frm_codigo, cd_menu_pai, no_menu, is_ativo)
			 VALUES (p_cd_menu, p_frm_codigo, p_cd_menu_pai, p_no_menu, p_is_ativo) 
	ON CONFLICT (cd_menu)
	DO UPDATE 
		    SET frm_codigo		= p_frm_codigo
					 ,cd_menu_pai		= p_cd_menu_pai
					 ,no_menu				= p_no_menu
					 ,is_ativo			= p_is_ativo;

	--	DELETE nas funções do menu
	DELETE FROM tbl_menu_funcao
	 WHERE cd_menu		= p_cd_menu
	   AND cd_funcao	NOT IN (SELECT A.cd_funcao FROM tbl_menu_permissao A WHERE A.cd_menu = tbl_menu_funcao.cd_menu);
	 
	--	INSERT nas funções do menu
	IF p_gn_funcao <> '' THEN
		IF RIGHT(p_gn_funcao, 1) = ';' THEN
			p_gn_funcao = LEFT(p_gn_funcao, LENGTH(p_gn_funcao) - 1);
		END IF;
		INSERT INTO tbl_menu_funcao (cd_menu, cd_funcao, is_gerencia)
			SELECT p_cd_menu
						,CAST(CASE WHEN RIGHT(cd_funcao, 1) = '+' THEN LEFT(cd_funcao, LENGTH(cd_funcao) - 1) ELSE cd_funcao END AS SMALLINT)
						,CASE WHEN RIGHT(cd_funcao, 1) = '+' THEN true ELSE false END AS is_gerencia
				FROM UNNEST((SELECT STRING_TO_ARRAY(p_gn_funcao, ';'))) AS cd_funcao
		ON CONFLICT ON CONSTRAINT tbl_menu_funcao_pkey
		DO UPDATE
				  SET is_gerencia	= EXCLUDED.is_gerencia;
	END IF;

END $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100