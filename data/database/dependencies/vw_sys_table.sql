DROP VIEW IF EXISTS vw_sys_table;

CREATE OR REPLACE VIEW vw_sys_table AS

SELECT Z.no_database
      ,Z.no_schema
      ,Z.is_view
      ,Z.no_tabela
      ,Z.no_campo
      ,Z.cd_coluna
      ,Z.no_tipo
      ,Z.nu_tamanho_maximo
      ,Z.nu_precisao
      ,Z.nu_escala
      ,Z.gn_tamanho_maximo
      ,(Z.cd_pk_ordem <> 0)                                                     AS is_primary_key
      ,Z.cd_pk_ordem
      ,(Z.cd_unique_ordem <> 0)                                                 AS is_unique
      ,cd_unique_ordem
      ,Z.is_nullable
      ,Z.is_identity
      ,Z.is_numeric
      ,Z.is_text
      ,Z.is_date
      ,Z.is_image
      ,Z.is_currency
      ,Z.ic_where
      ,Z.ds_default
      ,Z.gn_default
  FROM (
        SELECT A.table_catalog                                                  AS no_database
              ,A.table_schema                                                   AS no_schema
              ,(A.table_type = 'VIEW')                                          AS is_view
              ,A.table_name                                                     AS no_tabela
              ,B.column_name                                                    AS no_campo
              ,B.ordinal_position                                               AS cd_coluna
              ,UPPER(B.udt_name)                                                AS no_tipo
              ,B.character_maximum_length                                       AS nu_tamanho_maximo
              ,CASE WHEN B.udt_name IN ('float4', 'float8', 'numeric')
										THEN B.numeric_precision
										ELSE NULL END																								AS nu_precisao
              ,CASE WHEN B.udt_name IN ('float4', 'float8', 'numeric')
										THEN B.numeric_scale
										ELSE NULL END																								AS nu_escala
              ,CASE WHEN B.udt_name IN ('varchar', 'char', 'bpchar')
                    THEN '(' || B.character_maximum_length || ')'
                    WHEN B.udt_name IN ('float4', 'float8', 'numeric')
                    THEN '(' || B.numeric_precision || ',' || B.numeric_scale || ')'
                    ELSE ''
                END                                                             AS gn_tamanho_maximo
              ,COALESCE((SELECT A2.ordinal_position
                           FROM information_schema.table_constraints A1
                          INNER JOIN information_schema.key_column_usage A2 ON A2.table_catalog = A1.table_catalog AND A2.table_schema = A1.table_schema AND A2.table_name = A1.table_name AND A2.constraint_name = A1.constraint_name
                          WHERE A1.constraint_type = 'PRIMARY KEY'
                            AND A1.table_catalog   = A.table_catalog
                            AND A1.table_schema    = A.table_schema
                            AND A1.table_name      = A.table_name
                            AND A2.column_name     = B.column_name)
                        , 0)		                                            AS cd_pk_ordem
              ,COALESCE((SELECT A2.ordinal_position
                           FROM information_schema.table_constraints A1
                          INNER JOIN information_schema.key_column_usage A2 ON A2.table_catalog = A1.table_catalog AND A2.table_schema = A1.table_schema AND A2.table_name = A1.table_name AND A2.constraint_name = A1.constraint_name
                          WHERE A1.constraint_type = 'UNIQUE'
                            AND A1.table_catalog   = A.table_catalog
                            AND A1.table_schema    = A.table_schema
                            AND A1.table_name      = A.table_name
                            AND A2.column_name     = B.column_name)
                        , 0)		                                            AS cd_unique_ordem
              ,B.is_nullable 
              ,COALESCE((LEFT(CAST(B.column_default AS VARCHAR), 7) = 'nextval')
                       , false)                                                 AS is_identity
              ,(B.udt_name IN ('int2', 'int4', 'int8', 'float4', 'float8'))     AS is_numeric
              ,(B.udt_name IN ('varchar', 'char', 'bpchar'))                    AS is_text
              ,(B.udt_name IN ('timestamp', 'timestamptz', 'interval'))         AS is_date
              ,(B.udt_name = 'bytea')                                           AS is_image
              ,(B.udt_name IN ('float4', 'float8'))                             AS is_currency
              ,CASE WHEN B.udt_name IN ('bool', 'int2', 'int4', 'int8', 'float4', 'float8')
                    THEN ''
                    ELSE ''''
                END                                                             AS ic_where
              ,CASE WHEN B.udt_name IN ('timestamp', 'timestamptz', 'interval')
                    THEN '19000101'
                    WHEN B.udt_name IN ('int2', 'int4', 'int8', 'float4', 'float8')
                    THEN '0'
                    WHEN B.udt_name IN ('varchar', 'char', 'bpchar')
                    THEN ''
                    WHEN B.udt_name IN ('bool')
                    THEN 'false'
                END				                                                AS ds_default
              ,CASE WHEN B.udt_name IN ('timestamp', 'timestamptz', 'interval')
                    THEN ' = ''19000101'''
                    WHEN B.udt_name IN ('int2', 'int4', 'int8', 'float4', 'float8')
                    THEN ' = 0'
                    WHEN B.udt_name IN ('varchar', 'char', 'bpchar')
                    THEN ' = '''''
                    WHEN B.udt_name IN ('bool')
                    THEN ' = false'
                END				                                                AS gn_default                
          FROM information_schema.tables A
         INNER JOIN information_schema.columns B ON B.table_catalog = A.table_catalog AND B.table_schema = A.table_schema AND B.table_name = A.table_name
				 WHERE A.table_schema NOT IN ('pg_catalog', 'information_schema')
        ) Z
;
