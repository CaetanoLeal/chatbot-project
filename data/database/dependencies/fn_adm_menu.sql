CREATE OR REPLACE FUNCTION "public"."fn_adm_menu"()
  RETURNS "pg_catalog"."void" AS $BODY$

DECLARE
 bt_add														CHAR(3)		= '01;';
 bt_edit													CHAR(3)		= '02;';
 bt_delete												CHAR(3)		= '03;';
 bt_recover												CHAR(3)		= '04;';
 bt_print													CHAR(3)		= '05;';
 bt_audit													CHAR(3)		= '06;';
 bt_finalizar											CHAR(3)		= '07;';
 bt_grid_export										CHAR(3)		= '08;';
 bg_delete												CHAR(4)		= '03+;';
 bg_recover												CHAR(4)		= '04+;';
 bg_finalizar											CHAR(4)		= '07+;';
 bt_padrao												CHAR(21)	= CONCAT(bt_add, bt_edit, bt_delete, bt_recover, bt_print, bt_audit, bt_grid_export);
 bg_padrao												CHAR(23)	= CONCAT(bt_add, bt_edit, bg_delete, bg_recover, bt_print, bt_audit, bt_grid_export);
 bt_padrao_finalizar							CHAR(24)	= CONCAT(bt_padrao, bt_finalizar);
 bg_padrao_finalizar							CHAR(27)	= CONCAT(bg_padrao, bg_finalizar);
 v_no_menu												VARCHAR(100);
 v_cd_menu												INT2;
 
BEGIN

	--	Incluir menu
	PERFORM fn_add_menu(0, null, 0, '\');

	-- Favoritos ############################################################################## --
	PERFORM fn_add_menu(10000, null, 0, '[Favoritos]');
	
	-- Mais Acessados ######################################################################### --
	PERFORM fn_add_menu(10001, null, 0, '[Mais Acessados]');
	
	PERFORM fn_add_menu(99999, null, 0, 'Homologação');
		SELECT COALESCE((SELECT A1.frm_codigo FROM fr_formulario A1 WHERE A1.frm_descricao = A.no_menu), 233), A.no_menu INTO v_cd_menu, v_no_menu FROM (SELECT 'Teste' AS no_menu) A;
		PERFORM fn_add_menu(999, v_cd_menu, 99999, v_no_menu, true, bt_padrao);
	
	-- Administração ########################################################################## --
	PERFORM fn_add_menu(10100, null, 0, 'Administração');
		SELECT COALESCE((SELECT A1.frm_codigo FROM fr_formulario A1 WHERE A1.frm_descricao = A.no_menu), 233), A.no_menu INTO v_cd_menu, v_no_menu FROM (SELECT 'Configurações' AS no_menu) A;
		PERFORM fn_add_menu(10, v_cd_menu, 10100, v_no_menu, true, CONCAT(bt_edit, bt_print, bt_audit));
--		SELECT COALESCE((SELECT A1.frm_codigo FROM fr_formulario A1 WHERE A1.frm_descricao = A.no_menu), 233), A.no_menu INTO v_cd_menu, v_no_menu FROM (SELECT 'Feriado' AS no_menu) A;
--		PERFORM fn_add_menu(21, v_cd_menu, 10100, v_no_menu, true, bt_padrao);

	-- Cadastro ############################################################################## --
	PERFORM fn_add_menu(10200, null, 0, 'Cadastro');
	
/*
		PERFORM fn_add_menu(10205, null, 10200, 'Cliente');
			SELECT COALESCE((SELECT A1.frm_codigo FROM fr_formulario A1 WHERE A1.frm_descricao = A.no_menu), 233), A.no_menu INTO v_cd_menu, v_no_menu FROM (SELECT 'Cliente' AS no_menu) A;
			PERFORM fn_add_menu(110, v_cd_menu, 10205, v_no_menu, true, bt_padrao);
			PERFORM fn_add_menu(111, 233, 10205, 'Cliente Simplificado', true, bg_padrao);
			PERFORM fn_add_menu(112, 233, 10205, 'Grupo de Clientes', true, bg_padrao);
			PERFORM fn_add_menu(113, 192, 10205, 'Rota de Entrega', true, bg_padrao);
			PERFORM fn_add_menu(114, 4, 10205, 'Segmento', true, bg_padrao);
			PERFORM fn_add_menu(115, 277, 10205, 'Conservadora', true, bg_padrao);

		PERFORM fn_add_menu(10210, null, 10200, 'Cobrança');
			PERFORM fn_add_menu(150, 135, 10210, 'Cobrador', true, bg_padrao);
			
		PERFORM fn_add_menu(10225, null, 10200, 'Comercial');
			PERFORM fn_add_menu(180, 157, 10225, 'Forma de Pagamento', true, bg_padrao);
			PERFORM fn_add_menu(181, 199, 10225, 'Plano de Pagamento', true, bg_padrao);
			PERFORM fn_add_menu(182, 288, 10225, 'Tabela de Preços', true, bg_padrao);
	
		PERFORM fn_add_menu(10230, null, 10200, 'Contabilista');
			PERFORM fn_add_menu(170, 225, 10230, 'Contabilista', true, bg_padrao);
			PERFORM fn_add_menu(171, 226, 10230, 'Plano de Contas Contábil', true, bg_padrao);
		PERFORM fn_add_menu(10235, null, 10200, 'CRM');

		PERFORM fn_add_menu(10240, null, 10200, 'Empresa');
			PERFORM fn_add_menu(109, 28, 10240, 'Cargo', true, bg_padrao);
			PERFORM fn_add_menu(101, 233, 10240, 'Empresa', true, bg_padrao);
			PERFORM fn_add_menu(103, 233, 10240, 'Entidade', true, bg_padrao);
			PERFORM fn_add_menu(106, 271, 10240, 'Entregador', true, bg_padrao);
			PERFORM fn_add_menu(102, 273, 10240, 'Funcionário', true, bg_padrao);
			PERFORM fn_add_menu(105, 274, 10240, 'Motorista', true, bg_padrao);
			PERFORM fn_add_menu(104, 275, 10240, 'Responsável Técnico', true, bg_padrao);

--fn_add_menu(p_cd_menu::INT, p_frm_codigo::INT, p_cd_menu_pai::INT, p_no_menu::VARCHAR) ###################################
		PERFORM fn_add_menu(10245, null, 10200, 'Financeiro');
			PERFORM fn_add_menu(1233, 46, 10245, 'Banco', true, bg_padrao);
			PERFORM fn_add_menu(165, 156, 10245, 'Cartão', true, bg_padrao);
			PERFORM fn_add_menu(168, 43, 10245, 'Centro de Custo', true, bg_padrao);
			PERFORM fn_add_menu(167, 140, 10245, 'Conta', true, bg_padrao);
			PERFORM fn_add_menu(169, 233, 10245, 'Tipo de Lançamento', true, bg_padrao);
			
		PERFORM fn_add_menu(10250, null, 10200, 'Fornecedor');
			PERFORM fn_add_menu(133, 100, 10250, 'Fabricante', true, bg_padrao);
			PERFORM fn_add_menu(130, 255, 10250, 'Fornecedor', true, bg_padrao);
			PERFORM fn_add_menu(132, 233, 10250, 'Grupo de Fornecedores', true, bg_padrao);
		
		PERFORM fn_add_menu(10255, null, 10200, 'Localização');
			PERFORM fn_add_menu(156, 233, 10255, 'Bairro', true, bg_padrao);
			PERFORM fn_add_menu(155, 233, 10255, 'Cidade', true, bg_padrao);
*/
		PERFORM fn_add_menu(10260, null, 10200, 'Pessoa');
			SELECT COALESCE((SELECT A1.frm_codigo FROM fr_formulario A1 WHERE A1.frm_descricao = A.no_menu), 233), A.no_menu INTO v_cd_menu, v_no_menu FROM (SELECT 'Pessoa' AS no_menu) A;
			PERFORM fn_add_menu(100, v_cd_menu, 10260, v_no_menu, true, bt_padrao);
/*
		PERFORM fn_add_menu(10265, null, 10200, 'Produto');
			PERFORM fn_add_menu(10266, null, 10265, 'Categorização');
				PERFORM fn_add_menu(124, 91, 10266, 'Categoria', true, bg_padrao);
				PERFORM fn_add_menu(126, 93, 10266, 'Linha', true, bg_padrao);
				PERFORM fn_add_menu(125, 92, 10266, 'Sub-Categoria', true, bg_padrao);
			
			PERFORM fn_add_menu(128, 260, 10265, 'Grupo de Preço', true, bg_padrao);
			PERFORM fn_add_menu(123, 89, 10265, 'Marca', true, bg_padrao);
			PERFORM fn_add_menu(120, 240, 10265, 'Produto', true, bg_padrao);
			PERFORM fn_add_menu(129, 233, 10265, 'Produto por XML', true, bg_padrao);
			PERFORM fn_add_menu(127, 233, 10265, 'Unidade de Medida', true, bg_padrao);
		
		PERFORM fn_add_menu(10270, null, 10200, 'Vendedor');
			PERFORM fn_add_menu(141, 88, 10270, 'Equipe de Vendas', true, bg_padrao);
			PERFORM fn_add_menu(146, 233, 10270, 'Grupo de Comissão', true, bg_padrao);
			PERFORM fn_add_menu(140, 141, 10270, 'Vendedor', true, bg_padrao);
	
	-- Cobrança ############################################################################### --
	PERFORM fn_add_menu(10300, null, 0, 'Cobrança');
		PERFORM fn_add_menu(252, 233, 10300, 'Agenda de Cobrança', true, bg_padrao);
		PERFORM fn_add_menu(253, 233, 10300, 'Cobrança', true, bg_padrao);
		PERFORM fn_add_menu(251, 233, 10300, 'Contas a Receber/Recebidas', true, bg_padrao);
		
	-- Comercial ############################################################################## --
	PERFORM fn_add_menu(10400, null, 0, 'Comercial');
		PERFORM fn_add_menu(10405, null, 10400, 'Cliente');
			PERFORM fn_add_menu(201, 233, 10405, 'Análise de Crédito', true, bg_padrao);
			PERFORM fn_add_menu(203, 455, 10405, 'Ficha Financeira', true, bg_padrao);
		
		PERFORM fn_add_menu(10410, null, 10400, 'Equipe de Vendas');
			PERFORM fn_add_menu(213, 233, 10410, 'Fechamento de Comissão', true, bg_padrao);
			PERFORM fn_add_menu(214, 233, 10410, 'Meta de Vendas', true, bg_padrao);
			PERFORM fn_add_menu(215, 233, 10410, 'Premiação Sobre Vendas', true, bg_padrao);
		
		PERFORM fn_add_menu(10415, null, 10400, 'Plano de Assistência em Vendas');
			PERFORM fn_add_menu(220, 233, 10415, 'Plano de Assistência em Vendas', true, bg_padrao);
			PERFORM fn_add_menu(221, 233, 10415, 'Plano de Rota de Vendas', true, bg_padrao);
			PERFORM fn_add_menu(229, 233, 10415, 'Vista do Vendedor', true, bg_padrao);
		
		PERFORM fn_add_menu(10420, null, 10400, 'Precificação');
			PERFORM fn_add_menu(241, 290, 10420, 'Formação de Preços', true, bg_padrao);
			PERFORM fn_add_menu(240, 288, 10420, 'Tabela de Preços', true, bg_padrao);
		
		PERFORM fn_add_menu(10425, null, 10400, 'Verbas');
			PERFORM fn_add_menu(255, 233, 10425, 'Verbas: Controle de Verbas', true, bg_padrao);
		
		PERFORM fn_add_menu(200, 233, 10400, 'Gerência Comercial', true, bg_padrao);
	
	-- CRM - Relacionamento com Cliente ####################################################### --
	PERFORM fn_add_menu(10500, null, 0, 'CRM - Relacionamento com Cliente');
		PERFORM fn_add_menu(10505, null, 10500, 'CRM - Contato');
			PERFORM fn_add_menu(061, 233, 10505, 'CRM - Contato', true, bg_padrao);
			PERFORM fn_add_menu(062, 233, 10505, 'CRM - Tipo de Contato', true, bg_padrao);
			PERFORM fn_add_menu(063, 233, 10505, 'CRM - Tipo de Retorno', true, bg_padrao);
		
		PERFORM fn_add_menu(0233, 233, 10500, 'CRM - Agenda de Compromissos', true, bg_padrao);
		PERFORM fn_add_menu(066, 233, 10500, 'CRM - Modelo de Carta', true, bg_padrao);
	
	-- Entrada de Mercadorias ################################################################# --
	PERFORM fn_add_menu(10600, null, 0, 'Entrada de Mercadorias');
		PERFORM fn_add_menu(10605, null, 10600, 'Entrada de Mercadorias');
			PERFORM fn_add_menu(352, 517, 10605, 'Entrada de Mercadorias', true, bg_padrao);
			PERFORM fn_add_menu(353, 233, 10605, 'Recebimento Físico (Cego)', true, bg_padrao);
		
		PERFORM fn_add_menu(10610, null, 10600, 'Pedido de Compras');
			PERFORM fn_add_menu(340, 233, 10610, 'Agenda com Representante', true, bg_padrao);
			PERFORM fn_add_menu(342, 233, 10610, 'Cotação de Preços', true, bg_padrao);
			PERFORM fn_add_menu(345, 233, 10610, 'Gerência de Compras', true, bg_padrao);
			PERFORM fn_add_menu(341, 495, 10610, 'Pedido ao Fornecedor', true, bg_padrao);
		
		PERFORM fn_add_menu(350, 233, 10600, 'Manifestação de Destinatário', true, bg_padrao);
	
	-- Estoque ################################################################################ --
	PERFORM fn_add_menu(10700, null, 0, 'Estoque');
		PERFORM fn_add_menu(10705, null, 10700, 'Movimentação');
			PERFORM fn_add_menu(330, 233, 10705, 'Acerto de Estoque', true, bg_padrao);
			PERFORM fn_add_menu(331, 233, 10705, 'Movimento Interno', true, bg_padrao);
		
		PERFORM fn_add_menu(321, 233, 10700, 'Consulta Estoque', true, bg_padrao);
		PERFORM fn_add_menu(320, 233, 10700, 'Consulta Produto', true, bg_padrao);
		PERFORM fn_add_menu(323, 233, 10700, 'Gerenciador de Etiquetas', true, bg_padrao);
		PERFORM fn_add_menu(322, 309, 10700, 'Kardex de Produtos', true, bg_padrao);
	
	-- Financeiro ############################################################################# --
	PERFORM fn_add_menu(10800, null, 0, 'Financeiro');
		PERFORM fn_add_menu(10805, null, 10800, 'Caixa');
			PERFORM fn_add_menu(518, 233, 10805, 'Alteração de Título', true, bg_padrao);
			PERFORM fn_add_menu(512, 233, 10805, 'Diário de Transação', true, bg_padrao);
			PERFORM fn_add_menu(511, 233, 10805, 'Fechamento de Caixa', true, bg_padrao);
			PERFORM fn_add_menu(510, 221, 10805, 'Operação de Caixa', true, bg_padrao);
			PERFORM fn_add_menu(514, 233, 10805, 'Recebimento Bancário', true, bg_padrao);
			PERFORM fn_add_menu(513, 233, 10805, 'Recebimento de Título', true, bg_padrao);
			PERFORM fn_add_menu(515, 233, 10805, 'Recebimento Romaneio', true, bg_padrao);
		
		PERFORM fn_add_menu(10810, null, 10800, 'Tesouraria');
			PERFORM fn_add_menu(520, 233, 10810, 'Análise de Resultados', true, bg_padrao);
			PERFORM fn_add_menu(521, 233, 10810, 'Análise Financeira', true, bg_padrao);
			PERFORM fn_add_menu(505, 233, 10810, 'Controle de Cartão', true, bg_padrao);
			PERFORM fn_add_menu(504, 233, 10810, 'Controle de Cheque', true, bg_padrao);
			PERFORM fn_add_menu(502, 233, 10810, 'Controle de Lançamento', true, bg_padrao);
			PERFORM fn_add_menu(523, 233, 10810, 'DNI - Depósito Não Identificado', true, bg_padrao);
			PERFORM fn_add_menu(501, 425, 10810, 'Lançamento Financeiro', true, bg_padrao);
			PERFORM fn_add_menu(500, 218, 10810, 'Operação de Tesouraria', true, bg_padrao);
			PERFORM fn_add_menu(503, 483, 10810, 'Transferência Entre Contas', true, bg_padrao);
		
		PERFORM fn_add_menu(530, 233, 10800, 'Gerência Financeira', true, bg_padrao);
	
	-- Fiscal ################################################################################# --
	PERFORM fn_add_menu(10900, null, 0, 'Fiscal');
		PERFORM fn_add_menu(10905, null, 10900, 'SPED');
			PERFORM fn_add_menu(560, 233, 10905, 'SPED Fiscal', true, bg_padrao);
	
	-- PCP - Controle de Produção ############################################################# --
	PERFORM fn_add_menu(11000, null, 0, 'PCP - Controle de Produção');
		PERFORM fn_add_menu(11005, null, 11000, 'Cadastro');
			PERFORM fn_add_menu(11006, null, 11005, 'Ferramenta');
				PERFORM fn_add_menu(703, 131, 11006, 'Ferramenta', true, bg_padrao);
				PERFORM fn_add_menu(704, 130, 11006, 'Grupo de Ferramentas', true, bg_padrao);
				
			PERFORM fn_add_menu(705, 129, 11005, 'Especificação', true, bg_padrao);
			PERFORM fn_add_menu(700, 132, 11005, 'Fase de Produção', true, bg_padrao);
			PERFORM fn_add_menu(701, 121, 11005, 'Máquina', true, bg_padrao);
			PERFORM fn_add_menu(706, 133, 11005, 'Motivo de Parada', true, bg_padrao);
			PERFORM fn_add_menu(702, 120, 11005, 'Recurso Humano', true, bg_padrao);
		
		PERFORM fn_add_menu(11010, null, 11000, 'Produção');
			PERFORM fn_add_menu(11011, null, 11010, 'Beneficiamento');
				PERFORM fn_add_menu(712, 233, 11011, 'Beneficiamento', true, bg_padrao);
				PERFORM fn_add_menu(713, 233, 11011, 'Equivalência de Produtos', true, bg_padrao);
			
			PERFORM fn_add_menu(711, 233, 11010, 'Produção', true, bg_padrao);
			PERFORM fn_add_menu(710, 233, 11010, 'Projeto', true, bg_padrao);
		
		PERFORM fn_add_menu(11015, null, 11000, 'QMS - Controle de Qualidade');
			PERFORM fn_add_menu(721, 233, 11015, 'Checklist', true, bg_padrao);
			PERFORM fn_add_menu(722, 233, 11015, 'Inspeção', true, bg_padrao);
		
		PERFORM fn_add_menu(11020, null, 11000, 'Treinamento');
			PERFORM fn_add_menu(726, 233, 11020, 'Curso', true, bg_padrao);
			PERFORM fn_add_menu(728, 233, 11020, 'Local de Treinamento', true, bg_padrao);
			PERFORM fn_add_menu(725, 233, 11020, 'Treinamento', true, bg_padrao);
		
	-- Relatórios ############################################################################# --
	PERFORM fn_add_menu(11100, null, 0, 'Relatórios');
		PERFORM fn_add_menu(11105, null, 11100, 'Cadastral');
			PERFORM fn_add_menu(901, 233, 11105, 'Cadastro', true, bg_padrao);
			PERFORM fn_add_menu(902, 233, 11105, 'Cliente', true, bg_padrao);
		
		PERFORM fn_add_menu(11110, null, 11100, 'Contábil');
			PERFORM fn_add_menu(950, 233, 11110, 'Contábil', true, bg_padrao);
		
		PERFORM fn_add_menu(11115, null, 11100, 'Contas');
			PERFORM fn_add_menu(910, 233, 11115, 'Contas a Receber/Pagar', true, bg_padrao);
			PERFORM fn_add_menu(911, 233, 11115, 'Contas a Receber/Recebidas', true, bg_padrao);
		
		PERFORM fn_add_menu(11120, null, 11100, 'Estoque');
			PERFORM fn_add_menu(920, 233, 11120, 'Estoque', true, bg_padrao);
			PERFORM fn_add_menu(921, 233, 11120, 'Estoque Diário', true, bg_padrao);
			PERFORM fn_add_menu(922, 233, 11120, 'Movimentação de Estoque', true, bg_padrao);
		
		PERFORM fn_add_menu(11125, null, 11100, 'Financeiro');
			PERFORM fn_add_menu(939, 233, 11125, 'Caixa', true, bg_padrao);
		
		PERFORM fn_add_menu(11130, null, 11100, 'Vendas');
			PERFORM fn_add_menu(943, 233, 11130, 'Cortes', true, bg_padrao);
			PERFORM fn_add_menu(941, 233, 11130, 'Estatísticas de Vendas', true, bg_padrao);
			PERFORM fn_add_menu(944, 233, 11130, 'Positivação', true, bg_padrao);
			PERFORM fn_add_menu(942, 233, 11130, 'Produtos Sem Vendas', true, bg_padrao);
			PERFORM fn_add_menu(940, 233, 11130, 'Vendas', true, bg_padrao);
		
		PERFORM fn_add_menu(900, 233, 11100, 'Gerador de Relatórios', true, bg_padrao);
*/	
	-- Segurança ############################################################################## --
	PERFORM fn_add_menu(11200, null, 0, 'Segurança');
-- 			SELECT COALESCE((SELECT A1.frm_codigo FROM fr_formulario A1 WHERE A1.frm_descricao = A.no_menu), 233), A.no_menu INTO v_cd_menu, v_no_menu FROM (SELECT 'Auditoria' AS no_menu) A;
-- 			PERFORM fn_add_menu(199, v_cd_menu, 11200, v_no_menu, true, bt_padrao);
 			SELECT COALESCE((SELECT A1.frm_codigo FROM fr_formulario A1 WHERE A1.frm_descricao = A.no_menu), 233), A.no_menu INTO v_cd_menu, v_no_menu FROM (SELECT 'Perfil do Usuário' AS no_menu) A;
			PERFORM fn_add_menu(191, v_cd_menu, 11200, v_no_menu, true, bt_padrao);
--		PERFORM fn_add_menu(192, 251, 11200, 'Permissão de Usuário', true, bg_padrao);
--		PERFORM fn_add_menu(190, 143, 11200, 'Usuário', true, bg_padrao);
/*
	-- Tributação ############################################################################# --
	PERFORM fn_add_menu(11300, null, 0, 'Tributação');
		PERFORM fn_add_menu(11305, null, 11300, 'Classificação Fiscal');
			PERFORM fn_add_menu(597, 233, 11305, 'Classe Fiscal de ICMS Entrada', true, bg_padrao);
			PERFORM fn_add_menu(598, 233, 11305, 'Classe Fiscal de ICMS Saída', true, bg_padrao);
			PERFORM fn_add_menu(599, 233, 11305, 'Classe Fiscal de IPI Saída', true, bg_padrao);
	
	-- Vendas ################################################################################# --
	PERFORM fn_add_menu(11400, null, 0, 'Vendas');
		PERFORM fn_add_menu(11405, null, 11400, 'Cobrança Bancária');
			PERFORM fn_add_menu(11406, null, 11405, 'Remessa Bancária');
				PERFORM fn_add_menu(450, 233, 11406, 'Remessa Bancária', true, bg_padrao);
			
			PERFORM fn_add_menu(11407, null, 11405, 'Retorno Bancário');
				PERFORM fn_add_menu(455, 233, 11407, 'Retorno Bancário', true, bg_padrao);
		
		PERFORM fn_add_menu(11410, null, 11400, 'Consulta');
			PERFORM fn_add_menu(422, 233, 11410, 'Consulta Nota', true, bg_padrao);
			PERFORM fn_add_menu(421, 233, 11410, 'Consulta Pré-Fatura', true, bg_padrao);
			PERFORM fn_add_menu(420, 233, 11410, 'Consulta Venda', true, bg_padrao);
		
		PERFORM fn_add_menu(11415, null, 11400, 'Expedição');
			PERFORM fn_add_menu(11416, null, 11415, 'Check-Out');
				PERFORM fn_add_menu(411, 233, 11416, 'Check-Out', true, bg_padrao);
				PERFORM fn_add_menu(412, 233, 11416, 'Check-Out Manual', true, bg_padrao);
			
			PERFORM fn_add_menu(11417, null, 11415, 'Corte');
				PERFORM fn_add_menu(413, 233, 11417, 'Corte', true, bg_padrao);
				PERFORM fn_add_menu(414, 233, 11417, 'Motivo de Corte', true, bg_padrao);
			
			PERFORM fn_add_menu(410, 233, 11415, 'Expedição', true, bg_padrao);
			PERFORM fn_add_menu(415, 233, 11415, 'Romaneio de Entrega', true, bg_padrao);
		
		PERFORM fn_add_menu(11420, null, 11400, 'Faturamento');
			PERFORM fn_add_menu(400, 233, 11420, 'Faturamento', true, bg_padrao);
			PERFORM fn_add_menu(403, 233, 11420, 'Faturamento Posterior', true, bg_padrao);
			PERFORM fn_add_menu(404, 233, 11420, 'Nota-Mãe', true, bg_padrao);
			PERFORM fn_add_menu(402, 233, 11420, 'Orçamento', true, bg_padrao);
			PERFORM fn_add_menu(401, 233, 11420, 'Venda Balcão', true, bg_padrao);
		
		PERFORM fn_add_menu(11425, null, 11400, 'Força de Vendas');
			PERFORM fn_add_menu(462, 233, 11425, 'Histórico Mobile', true, bg_padrao);
		
		PERFORM fn_add_menu(11430, null, 11400, 'Nota Fiscal');
			PERFORM fn_add_menu(441, 233, 11430, 'Alteração de Nota', true, bg_padrao);
			PERFORM fn_add_menu(440, 233, 11430, 'Gestão de NF-e', true, bg_padrao);
		
		PERFORM fn_add_menu(11435, null, 11400, 'Pendência');
			PERFORM fn_add_menu(434, 233, 11435, 'Consulta Pendência', true, bg_padrao);
			PERFORM fn_add_menu(433, 233, 11435, 'Entrega Pendente', true, bg_padrao);
			PERFORM fn_add_menu(432, 233, 11435, 'Pendência de Entrega', true, bg_padrao);
		
		PERFORM fn_add_menu(11440, null, 11400, 'Troca de Mercadorias');
			PERFORM fn_add_menu(431, 233, 11440, 'Motivo de Troca', true, bg_padrao);
			PERFORM fn_add_menu(430, 233, 11440, 'Troca de Mercadorias', true, bg_padrao);
	
	-- WMS #################################################################################### --
	PERFORM fn_add_menu(11500, null, 0, 'WMS');
		PERFORM fn_add_menu(11505, null, 11500, 'Cadastro');
			PERFORM fn_add_menu(302, 233, 11505, 'Área de Depósito', true, bg_padrao);
			PERFORM fn_add_menu(301, 108, 11505, 'Depósito', true, bg_padrao);
			PERFORM fn_add_menu(300, 113, 11505, 'Endereço de Estoque', true, bg_padrao);
		
		PERFORM fn_add_menu(11510, null, 11500, 'Estoque');
			PERFORM fn_add_menu(304, 233, 11510, 'Endereçamento de Produto', true, bg_padrao);
		
		PERFORM fn_add_menu(11515, null, 11500, 'Gestão de Estoque');
			PERFORM fn_add_menu(313, 233, 11515, 'Lote e Validade', true, bg_padrao);
		
		PERFORM fn_add_menu(11520, null, 11500, 'Inventário de Estoque');
			PERFORM fn_add_menu(336, 233, 11520, 'Conferência de Inventário', true, bg_padrao);
			PERFORM fn_add_menu(337, 233, 11520, 'Conferência Manual de Inventário', true, bg_padrao);
			PERFORM fn_add_menu(335, 233, 11520, 'Inventário de Estoque', true, bg_padrao);
			PERFORM fn_add_menu(338, 233, 11520, 'Resultado de Invetário', true, bg_padrao);
			
	-- Sincronização #################################################################################### --
	PERFORM fn_add_menu(11600, null, 0, 'Sincronização');
		PERFORM fn_add_menu(96, 188, 11600, 'Sincronização', true, bg_padrao);
		
-- SELECT * FROM fr_formulario WHERE frm_descricao LIKE'Pess%'

-- #########################################################################################################################		
	PERFORM fn_add_menu(99999, null, 0, 'Teste');
		PERFORM fn_add_menu(99, 448, 99999, 'Desdobramento', true, bg_padrao);
		PERFORM fn_add_menu(98, 182, 99999, 'Rastreamento Vendedor', true, bg_padrao);
		PERFORM fn_add_menu(97, 509, 99999, 'Gerência Compra', true, bg_padrao);
		PERFORM fn_add_menu(95, 528, 99999, 'Portal AFV', true, bg_padrao);
*/
	--	Incluir menu no perfil Administrador
	INSERT INTO tbl_perfil_menu (id_perfil, cd_menu)
		SELECT '00000000-0000-0000-0000-000000000000'
					,A.cd_menu
			FROM tbl_menu A
		 WHERE A.is_ativo	= true
		ON CONFLICT (id_perfil, cd_menu)
		DO NOTHING;
	
	UPDATE tbl_menu SET gn_menu_pai = fn_ret_menu_pai(cd_menu::INT4);

END $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100