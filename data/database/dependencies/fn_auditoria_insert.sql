CREATE OR REPLACE FUNCTION public.fn_auditoria_insert(
 p_no_tabela                            NAME
,p_nu_sessao                            CHAR(36)
,p_gn_where                             VARCHAR(8000)
,p_gn_order                             VARCHAR(8000)
) RETURNS VOID AS $$

DECLARE
    v_sql                                   VARCHAR(8000)   = '';
    rec_detail                              RECORD;
    cur_detail                              CURSOR(c_no_tabela    NAME)
                                            FOR SELECT A.no_campo, fn_ret_ds_campo(A.no_tabela, A.no_campo) AS ds_campo
                                                  FROM vw_sys_table A
                                                 WHERE A.no_tabela          = c_no_tabela
                                                   AND A.no_campo      NOT IN ('cd_exporta','nu_sessao','dh_inclusao','dh_exclusao','dh_alteracao','is_excluido')
                                                   AND A.is_primary_key     = false;

BEGIN

    -- Excluir registros anteriores
    BEGIN
        DELETE FROM public.aud_registro
         WHERE nu_sessao = p_nu_sessao;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao excluir aud_registro';
    END;

    -- Excluir detalhamentos anteriores
    BEGIN
        DELETE FROM public.aud_detalhe
         WHERE nu_sessao = p_nu_sessao;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao excluir aud_detalhe';
    END;

    -- Inserir registros de auditoria
    BEGIN
        v_sql   = 'INSERT INTO public.aud_registro (nu_sessao, id_sequencia, id_auditoria, dh_inicial, dh_final, cd_acao, ds_acao, no_usuario, no_computador, nu_ip, no_aplicacao, no_cliente, gn_query)'
               || '  SELECT ''' || p_nu_sessao || ''' AS nu_sessao'
               || '        ,ROW_NUMBER() OVER(ORDER BY A.dh_alteracao ASC) AS id_sequencia'
               || '        ,A.id_auditoria'
               || '        ,A.dh_alteracao AS dh_inicial'
               || '        ,A.dh_auditoria AS dh_final'
               || '        ,A.cd_acao'
               || '        ,fn_ret_acao(A.cd_acao) AS ds_acao'
               || '        ,UPPER(C.usr_login) AS no_usuario'
               || '        ,B.no_computador'
               || '        ,B.nu_ip'
               || '        ,A.no_aplicacao'
               || '        ,A.no_cliente'
               || '        ,A.gn_query'
               || '    FROM audit.' || p_no_tabela || '_audit A'
               || ' INNER JOIN tbl_usuario_sessao B ON B.nu_sessao = A.nu_sessao'
               || ' INNER JOIN fr_usuario C ON C.usr_codigo = B.cd_usuario'
               || p_gn_where || p_gn_order;
        EXECUTE v_sql;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao inserir aud_registro: %', v_sql;
    END;

    -- Inserir detalhamentos de auditoria
    BEGIN
        OPEN cur_detail(p_no_tabela);
        LOOP
            FETCH cur_detail INTO rec_detail;
            EXIT WHEN NOT FOUND;
            v_sql   = 'INSERT INTO public.aud_detalhe (nu_sessao, id_auditoria, no_campo, ds_campo, gn_antes, gn_depois)'
                   || '  SELECT ''' || p_nu_sessao || ''' AS nu_sessao'
                   || '        ,A.id_auditoria'
                   || '        ,''' || rec_detail.no_campo || ''''
                   || '        ,''' || rec_detail.ds_campo || ''''
                   || '        ,A.' || rec_detail.no_campo || '_old'
                   || '        ,A.' || rec_detail.no_campo
                   || '    FROM audit.' || p_no_tabela || '_audit A'
                   || p_gn_where || p_gn_order;
            EXECUTE v_sql;
        END LOOP;
        CLOSE cur_detail;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao inserir aud_detalhe: %', v_sql;
    END;
   
    --  RETURN
    RETURN;
END;
$$ LANGUAGE plpgsql;
