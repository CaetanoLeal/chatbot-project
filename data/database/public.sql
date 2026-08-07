/*
 Navicat Premium Dump SQL

 Source Server         : db_chatbot
 Source Server Type    : PostgreSQL
 Source Server Version : 150014 (150014)
 Source Host           : localhost:5432
 Source Catalog        : chatbot
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 150014 (150014)
 File Encoding         : 65001

 Date: 07/08/2026 19:53:41
*/


-- ----------------------------
-- Sequence structure for tbl_instancia_id_instancia_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tbl_instancia_id_instancia_seq";
CREATE SEQUENCE "public"."tbl_instancia_id_instancia_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tbl_mensagem_telegram_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tbl_mensagem_telegram_id_seq";
CREATE SEQUENCE "public"."tbl_mensagem_telegram_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tbl_mensagem_whatsapp_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tbl_mensagem_whatsapp_id_seq";
CREATE SEQUENCE "public"."tbl_mensagem_whatsapp_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tbl_provider_cd_provider_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tbl_provider_cd_provider_seq";
CREATE SEQUENCE "public"."tbl_provider_cd_provider_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tbl_status_cd_status_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tbl_status_cd_status_seq";
CREATE SEQUENCE "public"."tbl_status_cd_status_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for telegram_messages_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."telegram_messages_id_seq";
CREATE SEQUENCE "public"."telegram_messages_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for aud_detalhe
-- ----------------------------
DROP TABLE IF EXISTS "public"."aud_detalhe";
CREATE TABLE "public"."aud_detalhe" (
  "nu_sessao" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id_auditoria" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "no_campo" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "ds_campo" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "gn_antes" varchar(8000) COLLATE "pg_catalog"."default" NOT NULL,
  "gn_depois" varchar(8000) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of aud_detalhe
-- ----------------------------

-- ----------------------------
-- Table structure for aud_registro
-- ----------------------------
DROP TABLE IF EXISTS "public"."aud_registro";
CREATE TABLE "public"."aud_registro" (
  "nu_sessao" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id_sequencia" int4 NOT NULL,
  "id_auditoria" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "dh_inicial" timestamp(6) NOT NULL,
  "dh_final" timestamp(6) NOT NULL,
  "cd_acao" int2 NOT NULL,
  "ds_acao" varchar(15) COLLATE "pg_catalog"."default" NOT NULL,
  "no_usuario" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "no_computador" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "nu_ip" varchar(128) COLLATE "pg_catalog"."default" NOT NULL,
  "no_aplicacao" text COLLATE "pg_catalog"."default" NOT NULL,
  "no_cliente" text COLLATE "pg_catalog"."default" NOT NULL,
  "gn_query" text COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of aud_registro
-- ----------------------------

-- ----------------------------
-- Table structure for tbl_atalho
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_atalho";
CREATE TABLE "public"."tbl_atalho" (
  "id_atalho" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_atalho" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "ds_atalho" text COLLATE "pg_catalog"."default" NOT NULL,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_atalho
-- ----------------------------
INSERT INTO "public"."tbl_atalho" VALUES ('54c094a9-ae11-4d3e-b0ed-20d617af77b2', 'teste', 'teste', NULL, '2026-08-06 18:28:35.75794', '2026-08-06 18:28:35.75794', NULL, 'f');
INSERT INTO "public"."tbl_atalho" VALUES ('cac5c658-ffcb-4805-a6ec-e6b0e1a99d1f', 'lorem ipsum', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin ornare velit quis vulputate. Aliquam sit amet hendrerit nibh, a auctor enim. Suspendisse molestie in lacus ac ullamcorper. Fusce lobortis, mauris sit amet iaculis laoreet, neque justo lobortis risus, elementum congue ex turpis et nulla. Morbi efficitur, enim quis bibendum.', NULL, '2026-08-06 18:39:03.43939', '2026-08-06 18:39:03.43939', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_atendente
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_atendente";
CREATE TABLE "public"."tbl_atendente" (
  "id_atendente" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_atendente" varchar(100) COLLATE "pg_catalog"."default",
  "is_ia" bool NOT NULL DEFAULT false,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false,
  "im_atendente" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tbl_atendente
-- ----------------------------
INSERT INTO "public"."tbl_atendente" VALUES ('c869e391-2b8a-4a62-9fe0-45a2e00e4894', 'teste', 't', NULL, '2026-07-30 20:58:57.509923', '2026-07-30 20:58:57.509923', NULL, 'f', '');
INSERT INTO "public"."tbl_atendente" VALUES ('00000000-0000-0000-0000-000000000000', 'sistema', 't', NULL, '2026-07-31 17:24:22.570718', '2026-07-31 17:24:22.570718', NULL, 'f', NULL);
INSERT INTO "public"."tbl_atendente" VALUES ('721edef5-0d43-427b-912a-ba15380c4282', 'caetano', 'f', NULL, '2026-07-28 17:56:45.378541', '2026-07-31 18:37:08.069368', NULL, 'f', '');

-- ----------------------------
-- Table structure for tbl_atendente_setor
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_atendente_setor";
CREATE TABLE "public"."tbl_atendente_setor" (
  "id_atendente_setor" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_atendente" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id_setor" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_atendente_setor
-- ----------------------------
INSERT INTO "public"."tbl_atendente_setor" VALUES ('fd51cac0-4768-4c28-973f-e16405798f1f', 'c869e391-2b8a-4a62-9fe0-45a2e00e4894', '22222222-2222-2222-2222-222222222222', NULL, '2026-07-30 20:58:57.509923', '2026-07-30 20:58:57.509923', NULL, 'f');
INSERT INTO "public"."tbl_atendente_setor" VALUES ('60aead76-69be-46e4-adcc-5d335af49e07', '721edef5-0d43-427b-912a-ba15380c4282', 'af3e6d6d-8853-435c-bf02-48cf003fcecf', NULL, '2026-07-28 17:57:33.008468', '2026-07-31 18:37:08.069368', '2026-07-31 18:37:08.069368', 't');
INSERT INTO "public"."tbl_atendente_setor" VALUES ('14f991b2-de68-4166-8161-fee83a0b216e', '721edef5-0d43-427b-912a-ba15380c4282', 'af3e6d6d-8853-435c-bf02-48cf003fcecf', NULL, '2026-07-31 18:37:08.069368', '2026-07-31 18:37:08.069368', NULL, 'f');
INSERT INTO "public"."tbl_atendente_setor" VALUES ('eb17455f-f727-4429-b89b-18d7e13829e4', '721edef5-0d43-427b-912a-ba15380c4282', '00000000-0000-0000-0000-000000000000', NULL, '2026-07-31 18:37:08.069368', '2026-07-31 18:37:08.069368', NULL, 'f');
INSERT INTO "public"."tbl_atendente_setor" VALUES ('622e4ee2-1dc2-40c8-a2c3-b7baf27faa2e', '721edef5-0d43-427b-912a-ba15380c4282', '11111111-1111-1111-1111-111111111111', NULL, '2026-07-31 18:37:08.069368', '2026-07-31 18:37:08.069368', NULL, 'f');
INSERT INTO "public"."tbl_atendente_setor" VALUES ('e3ed8ab8-5f84-4baf-8a7c-bff3b822ee53', '721edef5-0d43-427b-912a-ba15380c4282', '22222222-2222-2222-2222-222222222222', NULL, '2026-07-31 18:37:08.069368', '2026-07-31 18:37:08.069368', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_campo
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_campo";
CREATE TABLE "public"."tbl_campo" (
  "id_campo" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "cd_campo_tipo" int2 NOT NULL DEFAULT 1,
  "no_campo" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "is_obrigatorio" bool NOT NULL DEFAULT true,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_campo
-- ----------------------------
INSERT INTO "public"."tbl_campo" VALUES ('dbfc2fdf-4f52-49ff-a277-829d678c2a83', 1, 'no_utilizador', 't', NULL, '2026-07-21 20:26:22.059515', '2026-07-21 20:26:22.065383', NULL, 'f');
INSERT INTO "public"."tbl_campo" VALUES ('3b9d05de-21e9-4aa4-ac0c-5dbcea3c5386', 4, 'dt_nascimento', 't', NULL, '2026-07-21 20:26:22.059515', '2026-07-21 20:26:22.065383', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_campo_tipo
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_campo_tipo";
CREATE TABLE "public"."tbl_campo_tipo" (
  "cd_campo_tipo" int2 NOT NULL,
  "ds_campo_tipo" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "gn_campo_erro" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tbl_campo_tipo
-- ----------------------------
INSERT INTO "public"."tbl_campo_tipo" VALUES (2, 'NÚMERO', 'Informe somente números');
INSERT INTO "public"."tbl_campo_tipo" VALUES (3, 'MONETARIO', 'Informe somente valores monetários');
INSERT INTO "public"."tbl_campo_tipo" VALUES (4, 'DATA', 'Informe uma data válida');
INSERT INTO "public"."tbl_campo_tipo" VALUES (5, 'HORA', 'Informe uma hora válida');
INSERT INTO "public"."tbl_campo_tipo" VALUES (6, 'DECIMAIS', 'Informe um valor válido');
INSERT INTO "public"."tbl_campo_tipo" VALUES (1, 'TEXTO', 'Informe um valor');

-- ----------------------------
-- Table structure for tbl_chat
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_chat";
CREATE TABLE "public"."tbl_chat" (
  "id_chat" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_utilizador" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_provider" int2 NOT NULL,
  "id_instancia" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "ultima_mensagem" text COLLATE "pg_catalog"."default",
  "dh_ultima_mensagem" timestamp(6),
  "nao_lidas" int4 DEFAULT 0,
  "dt_created_at" timestamp(6) DEFAULT now(),
  "dt_updated_at" timestamp(6) DEFAULT now(),
  "ds_foto_perfil" text COLLATE "pg_catalog"."default",
  "dh_last_seen" timestamp(6),
  "sg_chat_status" char(1) COLLATE "pg_catalog"."default",
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_chat
-- ----------------------------
INSERT INTO "public"."tbl_chat" VALUES ('3976afda-bdb6-42fa-a522-ed6aa0eabf87', '624685c7-c4d4-4a4a-a2bf-6039b93a92d6', 1, '9eabc07d-8a23-4e9d-84a5-cdc3a8f627a2', 'FUNCIONOU', '2026-08-07 22:53:21', 3, '2026-08-07 22:43:00.048579', '2026-08-07 22:53:20.256035', 'https://pps.whatsapp.net/v/t61.24694-24/534427359_1717037186198029_8333542587506839214_n.jpg?ccb=11-4&oh=01_Q5Aa5QGr1DXJAljgSXchL-ZBbgG4RE0EnaE_y4j6AOlfBO8w8g&oe=6A838E25&_nc_sid=5e03e0&_nc_cat=102', NULL, 'C', NULL, '2026-08-07 22:43:00.048579', '2026-08-07 22:43:00.048579', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_chat_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_chat_status";
CREATE TABLE "public"."tbl_chat_status" (
  "sg_chat_status" char(1) COLLATE "pg_catalog"."default" NOT NULL,
  "ds_chat_status" varchar(50) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of tbl_chat_status
-- ----------------------------
INSERT INTO "public"."tbl_chat_status" VALUES ('B', 'CHATBOT');
INSERT INTO "public"."tbl_chat_status" VALUES ('C', 'CADASTRO');
INSERT INTO "public"."tbl_chat_status" VALUES ('I', 'INTELIGENCIA ARTIFICIAL');
INSERT INTO "public"."tbl_chat_status" VALUES ('P', 'PENDENTE');
INSERT INTO "public"."tbl_chat_status" VALUES ('A', 'ABERTO');
INSERT INTO "public"."tbl_chat_status" VALUES ('H', 'HUMANO');

-- ----------------------------
-- Table structure for tbl_dia_semana
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_dia_semana";
CREATE TABLE "public"."tbl_dia_semana" (
  "nu_dia_semana" int2 NOT NULL,
  "ds_dia_semana" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "sg_dia_semana" char(3) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of tbl_dia_semana
-- ----------------------------
INSERT INTO "public"."tbl_dia_semana" VALUES (1, 'DOMINGO', 'DOM');
INSERT INTO "public"."tbl_dia_semana" VALUES (2, 'SEGUNDA-FEIRA', 'SEG');
INSERT INTO "public"."tbl_dia_semana" VALUES (3, 'TERÇA-FEIRA', 'TER');
INSERT INTO "public"."tbl_dia_semana" VALUES (4, 'QUARTA-FEIRA', 'QUA');
INSERT INTO "public"."tbl_dia_semana" VALUES (5, 'QUINTA-FEIRA', 'QUI');
INSERT INTO "public"."tbl_dia_semana" VALUES (6, 'SEXTA-FEIRA', 'SEX');
INSERT INTO "public"."tbl_dia_semana" VALUES (7, 'SÁBADO', 'SAB');

-- ----------------------------
-- Table structure for tbl_funil
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil";
CREATE TABLE "public"."tbl_funil" (
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_funil" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "ds_funil" text COLLATE "pg_catalog"."default",
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_funil
-- ----------------------------
INSERT INTO "public"."tbl_funil" VALUES ('4ab1e687-5405-4ed6-84ad-af8f3ff030aa', 'funil de teste', 'funil criado para testar nossas funções e as não telas', NULL, '2026-07-21 18:55:05.546924', '2026-07-21 18:55:05.546924', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_funil_cadastro
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_cadastro";
CREATE TABLE "public"."tbl_funil_cadastro" (
  "id_funil_cadastro" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "ds_mensagem" text COLLATE "pg_catalog"."default" NOT NULL,
  "is_aguardar" bool NOT NULL DEFAULT true,
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id_setor" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::bpchar,
  "cd_mensagem" int4 NOT NULL DEFAULT 0,
  "cd_mensagem_destino" int4 DEFAULT 0,
  "is_finalizar" bool NOT NULL DEFAULT false,
  "id_campo" char(36) COLLATE "pg_catalog"."default",
  "pos_x" numeric DEFAULT 0,
  "pos_y" numeric DEFAULT 0,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_funil_cadastro
-- ----------------------------
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('4fe1a10f-ee1a-4559-9eb0-8e070d6fd922', 'Seja bem-vindo!', 'f', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '00000000-0000-0000-0000-000000000000', 0, 1, 'f', NULL, 0, 40, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('45f92fed-6ea4-4cc8-a886-74f120a883b6', 'Para iniciarmos, me informe seu nome', 't', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '00000000-0000-0000-0000-000000000000', 1, 2, 'f', 'dbfc2fdf-4f52-49ff-a277-829d678c2a83', 380, 40, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('1412ad99-c092-4c5e-98cd-1f269dccb766', 'Você informou que seu nome é {no_utilizador}. Confirma o nome informado?', 'f', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '00000000-0000-0000-0000-000000000000', 2, NULL, 'f', NULL, 760, 40, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('64e98ca1-4c44-43f7-98d3-9fc4bf797acd', 'Obrigado por se cadastrar', 'f', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '00000000-0000-0000-0000-000000000000', 3, NULL, 't', NULL, 1900, -190, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('2b27c986-e2fd-4e74-886f-65a68f812b8c', 'Tudo bem, me informe seu nome novamente, por favor.', 't', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '00000000-0000-0000-0000-000000000000', 4, 2, 'f', 'dbfc2fdf-4f52-49ff-a277-829d678c2a83', 1140, 155, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('803ab749-3559-4976-92b4-3b04a152f91f', 'Agora me informe sua data de nascimento no formato: DD/MM/AAAA.', 't', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '00000000-0000-0000-0000-000000000000', 5, 6, 'f', '3b9d05de-21e9-4aa4-ac0c-5dbcea3c5386', 1140, -75, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('5136ecc8-7bea-4c1b-8560-abc5bb0eb8cd', 'Você informou que sua data de nascimento é: {dt_nascimento}. Confirma?', 'f', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '00000000-0000-0000-0000-000000000000', 6, NULL, 'f', NULL, 1520, -75, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('979918a6-603b-4f6f-a4a8-e68e3e5a3c7e', 'Tudo bem, me informe sua data de nascimento novamente, por favor.', 't', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '00000000-0000-0000-0000-000000000000', 7, 6, 'f', '3b9d05de-21e9-4aa4-ac0c-5dbcea3c5386', 1900, 40, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_funil_cadastro_botao
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_cadastro_botao";
CREATE TABLE "public"."tbl_funil_cadastro_botao" (
  "id_funil_cadastro_botao" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil_cadastro" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_botao" int2 NOT NULL,
  "ds_botao" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem_destino" int2 NOT NULL,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_funil_cadastro_botao
-- ----------------------------
INSERT INTO "public"."tbl_funil_cadastro_botao" VALUES ('96dcf5c3-1cde-4ce2-aff9-ac901d482807', '1412ad99-c092-4c5e-98cd-1f269dccb766', 1, 'SIM', 5, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro_botao" VALUES ('da12f466-7f27-4ffb-9c13-31ed83413365', '1412ad99-c092-4c5e-98cd-1f269dccb766', 2, 'NÃO', 4, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro_botao" VALUES ('654dba67-285f-4a1b-bab4-8147827ccf56', '5136ecc8-7bea-4c1b-8560-abc5bb0eb8cd', 1, 'SIM', 3, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_cadastro_botao" VALUES ('96e8e5d1-d414-4b8f-a976-22b4c24d95d7', '5136ecc8-7bea-4c1b-8560-abc5bb0eb8cd', 2, 'NÃO', 7, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_funil_chatbot
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_chatbot";
CREATE TABLE "public"."tbl_funil_chatbot" (
  "id_funil_chatbot" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "ds_mensagem" text COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem_destino" int4,
  "is_aguardar" bool NOT NULL DEFAULT true,
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id_setor" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::bpchar,
  "cd_mensagem" int4 NOT NULL DEFAULT 0,
  "is_finalizar" bool NOT NULL DEFAULT false,
  "id_campo" char(36) COLLATE "pg_catalog"."default",
  "pos_x" numeric DEFAULT 0,
  "pos_y" numeric DEFAULT 0,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_funil_chatbot
-- ----------------------------
INSERT INTO "public"."tbl_funil_chatbot" VALUES ('800717cc-04bf-475c-a69a-903338fc02f5', 'Vi que você ja fez seu cadastro então você será atendido, o que deseja?', NULL, 'f', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '11111111-1111-1111-1111-111111111111', 0, 'f', NULL, 0, 38.70532544378699, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_chatbot" VALUES ('18fd3492-964a-43a6-bdaa-488cd9a4095e', 'ok, logo ele responderá sua mensagem', NULL, 'f', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', 'af3e6d6d-8853-435c-bf02-48cf003fcecf', 3, 't', NULL, 378.5128094670216, -75, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_chatbot" VALUES ('6ac17f14-3ece-4e3b-a3f3-f53ca9e28a5c', 'Selecione a funcionalidade que você deseja testar', NULL, 'f', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '11111111-1111-1111-1111-111111111111', 4, 'f', NULL, 380, 155, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_chatbot" VALUES ('6e44afdd-2187-4fb0-839b-11b5ac04c444', 'A ia vai te atender agora, o que deseja?', NULL, 'f', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '22222222-2222-2222-2222-222222222222', 5, 't', NULL, 761.6432055749129, 155.54773519163763, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_funil_chatbot_botao
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_chatbot_botao";
CREATE TABLE "public"."tbl_funil_chatbot_botao" (
  "id_funil_chatbot_botao" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil_chatbot" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_botao" int2 NOT NULL,
  "ds_botao" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem_destino" int2,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_funil_chatbot_botao
-- ----------------------------
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('c9281526-4061-4467-992a-13c2659ac122', '800717cc-04bf-475c-a69a-903338fc02f5', 1, 'Falar com o dono do número', 3, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('002f9840-fd78-4431-8b3a-85c446b3fb48', '800717cc-04bf-475c-a69a-903338fc02f5', 2, 'Ajudar a testar funções', 4, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('032227b1-fecd-40c6-b239-17128bcb075f', '6ac17f14-3ece-4e3b-a3f3-f53ca9e28a5c', 1, 'testar IA', 5, NULL, '2026-08-06 19:13:24.065046', '2026-08-06 19:13:24.065046', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_funil_expiracao
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_expiracao";
CREATE TABLE "public"."tbl_funil_expiracao" (
  "id_funil_expiracao" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "gn_mensagem" text COLLATE "pg_catalog"."default" NOT NULL,
  "nu_sequencia" int2 NOT NULL DEFAULT 1,
  "qt_minutos" int2 NOT NULL DEFAULT 1,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_funil_expiracao
-- ----------------------------
INSERT INTO "public"."tbl_funil_expiracao" VALUES ('913c3e88-ca50-49b5-9e21-278761fc346d', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', 'Notamos que você não está conseguindo falar agora. Se quiseres prosseguir com o atendimento, por favor, interaja. Em 3 minutos validaremos novamente.', 1, 3, NULL, '2026-07-21 20:26:22.247153', '2026-07-21 20:26:22.253089', NULL, 'f');
INSERT INTO "public"."tbl_funil_expiracao" VALUES ('f45d579a-5978-4a5b-b589-94af6df414f2', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', 'Nossa, não estamos conseguindo prosseguir. Vou aguardar por mais 2 minutos, tá?', 2, 2, NULL, '2026-07-21 20:26:22.247153', '2026-07-21 20:26:22.253089', NULL, 'f');
INSERT INTO "public"."tbl_funil_expiracao" VALUES ('cf624ead-cac8-4122-a2b1-ebfcf92e2eef', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', 'Poxa, daqui a um minuto iremos encerrar nossa conversa. Porém, não se sinta acanhado. Chame-nos novamente sempre que desejar.', 3, 1, NULL, '2026-07-21 20:26:22.247153', '2026-07-21 20:26:22.253089', NULL, 'f');
INSERT INTO "public"."tbl_funil_expiracao" VALUES ('84c05a0f-f593-452b-922d-1eca3c424de3', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', 'É, iremos encerrar nosso atendimento. Obrigado!', 4, 0, NULL, '2026-07-21 20:26:22.247153', '2026-07-21 20:26:22.253089', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_funil_ia
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_ia";
CREATE TABLE "public"."tbl_funil_ia" (
  "id_funil_ia" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id_funil_ia_modelo" int2 NOT NULL,
  "id_setor" char(36) COLLATE "pg_catalog"."default",
  "no_agente" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "ds_funil" varchar(255) COLLATE "pg_catalog"."default",
  "ds_personalidade" text COLLATE "pg_catalog"."default" NOT NULL,
  "nu_temperature" numeric(10,2) NOT NULL,
  "nu_max_tokens" int4 NOT NULL,
  "is_ativo" bool NOT NULL,
  "ds_fallback" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL,
  "update_at" timestamp(6) NOT NULL,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false,
  "is_human_handoff" bool NOT NULL
)
;

-- ----------------------------
-- Records of tbl_funil_ia
-- ----------------------------
INSERT INTO "public"."tbl_funil_ia" VALUES ('7f27f63a-1000-4130-8c08-eb4d77839982', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', 2, '22222222-2222-2222-2222-222222222222', 'gaby', 'este funil tem o intuito de ser a namorada do leonan', 'você se chama gaby e você é namorada do leonan! você responde todas as perguntas lembrando algo carinhoso sobre o leonan ou falando coisas fofas a respeito dele. você é romântica demais e ama seu namorado. nunca esqueça de se apresentar para novos usuários! o leonan te chama de thitily e caso alguém que não seja o leonan te chame de thitily você deve ficar brava', 0.50, 300, 't', 'Desculpe a gaby não esta mais aqui', '2026-08-06 19:07:14.275814', '2026-08-06 19:07:14.275814', NULL, '2026-08-06 19:07:14.275814', '2026-08-06 19:07:14.275814', NULL, 'f', 't');

-- ----------------------------
-- Table structure for tbl_funil_ia_modelo
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_ia_modelo";
CREATE TABLE "public"."tbl_funil_ia_modelo" (
  "id_funil_ia_modelo" int2 NOT NULL,
  "ds_funil_ia_modelo" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "vl_token_dolar" numeric(20,10) DEFAULT 0
)
;

-- ----------------------------
-- Records of tbl_funil_ia_modelo
-- ----------------------------
INSERT INTO "public"."tbl_funil_ia_modelo" VALUES (1, 'gpt-4.1-mini', 0.0000000000);
INSERT INTO "public"."tbl_funil_ia_modelo" VALUES (2, 'gpt-4o-mini', 0.0000000000);

-- ----------------------------
-- Table structure for tbl_funil_utilizador
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_utilizador";
CREATE TABLE "public"."tbl_funil_utilizador" (
  "id_funil_utilizador" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id_utilizador" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem_cadastro" int4,
  "cd_mensagem_chatbot" int4,
  "dh_mensagem" timestamp(6),
  "dh_expiracao" timestamp(6),
  "id_setor" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "sg_chat_status" char(1) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 1,
  "is_cadastrado" bool NOT NULL DEFAULT false,
  "nu_expiracao" int2 DEFAULT 1
)
;

-- ----------------------------
-- Records of tbl_funil_utilizador
-- ----------------------------
INSERT INTO "public"."tbl_funil_utilizador" VALUES ('3d47bb68-0a19-45b0-93c0-59a2a55c80c7', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', '624685c7-c4d4-4a4a-a2bf-6039b93a92d6', 2, 0, '2026-08-07 22:53:00.484711', '2026-08-07 22:53:00.484711', '00000000-0000-0000-0000-000000000000', 'C', 'f', 4);

-- ----------------------------
-- Table structure for tbl_funil_utilizador_campo
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_utilizador_campo";
CREATE TABLE "public"."tbl_funil_utilizador_campo" (
  "id_funil_utilizador_campo" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil_utilizador" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_campo" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "vl_campo" text COLLATE "pg_catalog"."default",
  "dh_cadastro" timestamp(6) NOT NULL DEFAULT now(),
  "dh_atualizacao" timestamp(6) NOT NULL DEFAULT now(),
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_funil_utilizador_campo
-- ----------------------------
INSERT INTO "public"."tbl_funil_utilizador_campo" VALUES ('1099ded7-7a8f-4ad6-afb5-118ffd50f6aa', '3d47bb68-0a19-45b0-93c0-59a2a55c80c7', 'dbfc2fdf-4f52-49ff-a277-829d678c2a83', 'Não estou entendendo', '2026-08-07 22:44:00.938', '2026-08-07 22:44:00.938', NULL, '2026-08-07 22:44:00.938857', '2026-08-07 22:44:00.938857', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_instancia
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_instancia";
CREATE TABLE "public"."tbl_instancia" (
  "id_instancia" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_instancia" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_provider" int2 NOT NULL,
  "cd_status" int2 NOT NULL,
  "session_string" text COLLATE "pg_catalog"."default",
  "nu_telefone" varchar(20) COLLATE "pg_catalog"."default",
  "ds_webhook" text COLLATE "pg_catalog"."default",
  "ds_foto_perfil" text COLLATE "pg_catalog"."default",
  "dt_created_at" timestamp(6) NOT NULL DEFAULT now(),
  "dt_update_at" timestamp(6) NOT NULL DEFAULT now(),
  "ds_auth_path" text COLLATE "pg_catalog"."default",
  "id_funil" char(36) COLLATE "pg_catalog"."default",
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_instancia
-- ----------------------------
INSERT INTO "public"."tbl_instancia" VALUES ('9eabc07d-8a23-4e9d-84a5-cdc3a8f627a2', 'ultimo do dia', 1, 2, NULL, '559180625187', 'http://api_mensagem:3001/webhook', 'https://pps.whatsapp.net/v/t61.24694-24/534426916_2733709416980417_5815243121987960728_n.jpg?ccb=11-4&oh=01_Q5Aa5QHnpjB9v0MmfCjMLGIDvsHG3oqsLSMLjc_IZQBwApvFGg&oe=6A835C0B&_nc_sid=5e03e0&_nc_cat=104', '2026-08-07 22:39:35.698177', '2026-08-07 22:39:43.580678', '/usr/src/app/auth/60bc06b5-527b-4105-a4e4-47831f1dbdb8', '4ab1e687-5405-4ed6-84ad-af8f3ff030aa', NULL, '2026-08-07 22:39:35.698177', '2026-08-07 22:39:35.698177', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_mensagem
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_mensagem";
CREATE TABLE "public"."tbl_mensagem" (
  "id_mensagem" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_chat" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_provider" int2 NOT NULL,
  "id_mensagem_externa" char(36) COLLATE "pg_catalog"."default",
  "from_me" bool NOT NULL,
  "ds_conteudo" text COLLATE "pg_catalog"."default",
  "ds_tipo" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'text'::character varying,
  "ds_payload" jsonb,
  "dh_envio" timestamp(6) NOT NULL,
  "dt_created_at" timestamp(6) DEFAULT now(),
  "id_atendente" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::bpchar,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_mensagem
-- ----------------------------
INSERT INTO "public"."tbl_mensagem" VALUES ('86eb21f8-e723-4de5-9c08-838e453d76de', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3A5DA7B281AF7BEB9D88                ', 'f', 'Mandar o que?', 'text', '{"raw": {"conversation": "Mandar o que?", "messageContextInfo": {"messageSecret": "CaZOeQyLJ518mEEECaQj5t2JdWj2osWKi2mguPW6//0=", "deviceListMetadata": {"senderKeyHash": "EywvcfOHs4lhdw==", "senderTimestamp": "1785963966", "recipientKeyHash": "RjjWcXOB2AEtug==", "recipientTimestamp": "1786139560"}, "deviceListMetadataVersion": 2}}, "text": "Mandar o que?", "type": "text"}', '2026-08-07 22:40:06', '2026-08-07 22:43:00.077427', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:43:00.077427', '2026-08-07 22:43:00.077427', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('2beae312-61b4-4cf7-8276-2e7112b260d7', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3EB05D254B4901FF29458F              ', 't', 'Seja bem-vindo!', 'text', '{"raw": {"key": {"id": "3EB05D254B4901FF29458F", "fromMe": true, "remoteJid": "559182080606@s.whatsapp.net"}, "message": {"conversation": "Seja bem-vindo!"}}, "text": "Seja bem-vindo!", "type": "text"}', '2026-08-07 22:43:00', '2026-08-07 22:43:01.090819', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:43:01.090819', '2026-08-07 22:43:01.090819', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('722cb300-dc75-43ca-9d6d-037b970e7f1f', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3EB0250322139E38143B55              ', 't', 'Para iniciarmos, me informe seu nome', 'text', '{"raw": {"key": {"id": "3EB0250322139E38143B55", "fromMe": true, "remoteJid": "559182080606@s.whatsapp.net"}, "message": {"conversation": "Para iniciarmos, me informe seu nome"}}, "text": "Para iniciarmos, me informe seu nome", "type": "text"}', '2026-08-07 22:43:01', '2026-08-07 22:43:01.410927', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:43:01.410927', '2026-08-07 22:43:01.410927', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('4efe8f0a-09f3-45f4-b5b3-875f9ca934cc', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3AF3792FB6A8169C8EE1                ', 'f', 'Não estou entendendo', 'text', '{"raw": {"conversation": "Não estou entendendo", "messageContextInfo": {"messageSecret": "rb3EZttkykhEODftWOdj7tIqrSqTsN3KvU5lUGiu3mQ=", "deviceListMetadata": {"senderKeyHash": "EywvcfOHs4lhdw==", "senderTimestamp": "1785963966", "recipientKeyHash": "RjjWcXOB2AEtug==", "recipientTimestamp": "1786139560"}, "deviceListMetadataVersion": 2}}, "text": "Não estou entendendo", "type": "text"}', '2026-08-07 22:40:10', '2026-08-07 22:44:00.864864', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:44:00.864864', '2026-08-07 22:44:00.864864', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('13e31fac-3490-4e0b-a2a5-0532252999b7', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3EB00D98F40570ED2F0E37              ', 't', 'Você informou que seu nome é Não estou entendendo. Confirma o nome informado?

1 - SIM
2 - NÃO', 'text', '{"raw": {"key": {"id": "3EB00D98F40570ED2F0E37", "fromMe": true, "remoteJid": "559182080606@s.whatsapp.net"}, "message": {"conversation": "Você informou que seu nome é Não estou entendendo. Confirma o nome informado?\n\n1 - SIM\n2 - NÃO"}}, "text": "Você informou que seu nome é Não estou entendendo. Confirma o nome informado?\n\n1 - SIM\n2 - NÃO", "type": "text"}', '2026-08-07 22:44:01', '2026-08-07 22:44:01.301893', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:44:01.301893', '2026-08-07 22:44:01.301893', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('d22ba4dc-af5d-480b-9e6c-1c00df6516c4', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, 'AC6A059F353C53FB31AA233556DA27F3    ', 't', 'Valeu!', 'text', '{"raw": {"conversation": "Valeu!"}, "text": "Valeu!", "type": "text"}', '2026-08-07 22:40:20', '2026-08-07 22:44:02.897544', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:44:02.897544', '2026-08-07 22:44:02.897544', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('54e0d474-b353-4eec-8942-cf91a33f00a1', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3EB0264C53BA4C9A7842E0              ', 't', 'Notamos que você não está conseguindo falar agora. Se quiseres prosseguir com o atendimento, por favor, interaja. Em 3 minutos validaremos novamente.', 'text', '{"raw": {"key": {"id": "3EB0264C53BA4C9A7842E0", "fromMe": true, "remoteJid": "559182080606@s.whatsapp.net"}, "message": {"conversation": "Notamos que você não está conseguindo falar agora. Se quiseres prosseguir com o atendimento, por favor, interaja. Em 3 minutos validaremos novamente."}}, "text": "Notamos que você não está conseguindo falar agora. Se quiseres prosseguir com o atendimento, por favor, interaja. Em 3 minutos validaremos novamente.", "type": "text"}', '2026-08-07 22:48:00', '2026-08-07 22:48:00.775753', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:48:00.775753', '2026-08-07 22:48:00.775753', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('dfaa3666-0c64-4882-942b-9e320854af31', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3EB0763AD30FEB1D915E6C              ', 't', 'Nossa, não estamos conseguindo prosseguir. Vou aguardar por mais 2 minutos, tá?', 'text', '{"raw": {"key": {"id": "3EB0763AD30FEB1D915E6C", "fromMe": true, "remoteJid": "559182080606@s.whatsapp.net"}, "message": {"conversation": "Nossa, não estamos conseguindo prosseguir. Vou aguardar por mais 2 minutos, tá?"}}, "text": "Nossa, não estamos conseguindo prosseguir. Vou aguardar por mais 2 minutos, tá?", "type": "text"}', '2026-08-07 22:51:00', '2026-08-07 22:51:01.099691', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:51:01.099691', '2026-08-07 22:51:01.099691', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('0b0115fc-8125-4a0a-8b71-a7b2ab332d20', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3EB08FFA891E5BA69094AB              ', 't', 'Poxa, daqui a um minuto iremos encerrar nossa conversa. Porém, não se sinta acanhado. Chame-nos novamente sempre que desejar.', 'text', '{"raw": {"key": {"id": "3EB08FFA891E5BA69094AB", "fromMe": true, "remoteJid": "559182080606@s.whatsapp.net"}, "message": {"conversation": "Poxa, daqui a um minuto iremos encerrar nossa conversa. Porém, não se sinta acanhado. Chame-nos novamente sempre que desejar."}}, "text": "Poxa, daqui a um minuto iremos encerrar nossa conversa. Porém, não se sinta acanhado. Chame-nos novamente sempre que desejar.", "type": "text"}', '2026-08-07 22:53:00', '2026-08-07 22:53:00.461672', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:53:00.461672', '2026-08-07 22:53:00.461672', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('ac9ff1a8-c6bb-46f1-a3f2-6bf6170e3010', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3AC42BE1BB65FD9EAB66                ', 'f', 'O que vc quer?', 'text', '{"raw": {"conversation": "O que vc quer?", "messageContextInfo": {"messageSecret": "mXtj/h1QeVmD8b6arutIaq5K48PXIcwgbTjKZA+CqnI=", "deviceListMetadata": {"senderKeyHash": "EywvcfOHs4lhdw==", "senderTimestamp": "1785963966", "recipientKeyHash": "RjjWcXOB2AEtug==", "recipientTimestamp": "1786139560"}, "deviceListMetadataVersion": 2}}, "text": "O que vc quer?", "type": "text"}', '2026-08-07 22:40:47', '2026-08-07 22:53:11.21128', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:53:11.21128', '2026-08-07 22:53:11.21128', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('409b332e-cdda-4a98-872e-93323c2fe3af', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, '3EB0D080C041B3A51F8974              ', 't', 'Resposta inválida! Digite o número correspondente à opção desejada.', 'text', '{"raw": {"key": {"id": "3EB0D080C041B3A51F8974", "fromMe": true, "remoteJid": "559182080606@s.whatsapp.net"}, "message": {"conversation": "Resposta inválida! Digite o número correspondente à opção desejada."}}, "text": "Resposta inválida! Digite o número correspondente à opção desejada.", "type": "text"}', '2026-08-07 22:53:11', '2026-08-07 22:53:11.321885', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:53:11.321885', '2026-08-07 22:53:11.321885', NULL, 'f');
INSERT INTO "public"."tbl_mensagem" VALUES ('ccb5ed7f-797c-4a49-b985-176eabd26c12', '3976afda-bdb6-42fa-a522-ed6aa0eabf87', 1, 'ACACB8860F7BDF00DCAF34503B8E511F    ', 't', 'FUNCIONOU', 'text', '{"raw": {"conversation": "FUNCIONOU"}, "text": "FUNCIONOU", "type": "text"}', '2026-08-07 22:53:21', '2026-08-07 22:53:20.245754', '00000000-0000-0000-0000-000000000000', NULL, '2026-08-07 22:53:20.245754', '2026-08-07 22:53:20.245754', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_mensagem_telegram
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_mensagem_telegram";
CREATE TABLE "public"."tbl_mensagem_telegram" (
  "id" int4 NOT NULL DEFAULT nextval('tbl_mensagem_telegram_id_seq'::regclass),
  "id_mensagem" int8,
  "constructor_id" int8,
  "subclass_of_id" int8,
  "class_name" varchar(100) COLLATE "pg_catalog"."default",
  "class_type" varchar(50) COLLATE "pg_catalog"."default",
  "from_user_id" int8,
  "peer_user_id" int8,
  "out" bool,
  "mentioned" bool,
  "media_unread" bool,
  "silent" bool,
  "ttl_period" int4,
  "data_envio" timestamp(6),
  "mensagem" text COLLATE "pg_catalog"."default",
  "fwd_from" jsonb,
  "via_bot_id" int8,
  "reply_to" jsonb,
  "media" jsonb,
  "entities" jsonb,
  "views" int4,
  "forwards" int4,
  "replies" jsonb,
  "edit_date" timestamp(6),
  "pinned" bool,
  "grouped_id" int8,
  "restriction_reason" jsonb,
  "noforwards" bool,
  "created_at" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of tbl_mensagem_telegram
-- ----------------------------

-- ----------------------------
-- Table structure for tbl_mensagem_whatsapp
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_mensagem_whatsapp";
CREATE TABLE "public"."tbl_mensagem_whatsapp" (
  "id" int4 NOT NULL DEFAULT nextval('tbl_mensagem_whatsapp_id_seq'::regclass),
  "id_mensagem" varchar(150) COLLATE "pg_catalog"."default",
  "id_chat" varchar(150) COLLATE "pg_catalog"."default",
  "id_interno" varchar(150) COLLATE "pg_catalog"."default",
  "serialized_id" varchar(150) COLLATE "pg_catalog"."default",
  "from_me" bool DEFAULT false,
  "ack" int4,
  "body" text COLLATE "pg_catalog"."default",
  "type" varchar(50) COLLATE "pg_catalog"."default",
  "remote" varchar(150) COLLATE "pg_catalog"."default",
  "from_number" varchar(150) COLLATE "pg_catalog"."default",
  "to_number" varchar(150) COLLATE "pg_catalog"."default",
  "author" varchar(150) COLLATE "pg_catalog"."default",
  "notify_name" varchar(150) COLLATE "pg_catalog"."default",
  "is_starred" bool DEFAULT false,
  "timestamp" int8,
  "client_received_ts" int8,
  "dh_cadastro" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of tbl_mensagem_whatsapp
-- ----------------------------
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2119, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785517886447, '2026-07-31 17:11:26.46982');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2120, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785520659823, '2026-07-31 17:57:39.824966');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2153, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785521754135, '2026-07-31 18:15:54.173503');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2154, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785522940434, '2026-07-31 18:35:40.435361');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2155, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785522954555, '2026-07-31 18:35:54.556253');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2156, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785522959248, '2026-07-31 18:35:59.249348');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2157, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785522964264, '2026-07-31 18:36:04.266066');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2158, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785522970645, '2026-07-31 18:36:10.646143');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2159, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785522974862, '2026-07-31 18:36:14.863337');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2160, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785522989312, '2026-07-31 18:36:29.31255');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2187, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785523899468, '2026-07-31 18:51:39.504244');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2188, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785523907175, '2026-07-31 18:51:47.17603');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2189, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785524178186, '2026-07-31 18:56:18.188327');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2190, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785524178875, '2026-07-31 18:56:18.877186');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2191, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785524184491, '2026-07-31 18:56:24.495114');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2192, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785524188922, '2026-07-31 18:56:28.922975');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2193, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785524192213, '2026-07-31 18:56:32.217078');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2194, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785526483007, '2026-07-31 19:34:43.029823');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2195, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785526504809, '2026-07-31 19:35:04.810451');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2196, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785526557670, '2026-07-31 19:35:57.671266');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2197, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785527275821, '2026-07-31 19:47:55.822494');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2198, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785527279387, '2026-07-31 19:47:59.388869');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2199, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785527475823, '2026-07-31 19:51:15.824091');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2200, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785527538587, '2026-07-31 19:52:18.588041');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2201, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785528456841, '2026-07-31 20:07:36.857746');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2234, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785533438852, '2026-07-31 21:30:38.853284');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2235, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534239337, '2026-07-31 21:43:59.378028');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2236, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534255634, '2026-07-31 21:44:15.635757');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2237, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534278303, '2026-07-31 21:44:38.305268');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2238, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534321639, '2026-07-31 21:45:21.641102');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2239, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534368425, '2026-07-31 21:46:08.46476');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2240, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534599457, '2026-07-31 21:49:59.473685');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2241, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534628670, '2026-07-31 21:50:28.671667');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2242, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534642893, '2026-07-31 21:50:42.894405');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2243, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534647601, '2026-07-31 21:50:47.602729');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2244, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534652855, '2026-07-31 21:50:52.856773');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2245, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534657652, '2026-07-31 21:50:57.653011');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2246, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534666710, '2026-07-31 21:51:06.711474');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2247, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534674284, '2026-07-31 21:51:14.285842');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2248, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534678780, '2026-07-31 21:51:18.780891');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2249, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534682318, '2026-07-31 21:51:22.32008');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2250, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534690706, '2026-07-31 21:51:30.711851');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2251, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534693811, '2026-07-31 21:51:33.812721');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2252, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534705660, '2026-07-31 21:51:45.662442');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2253, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534736062, '2026-07-31 21:52:16.063042');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2254, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534739356, '2026-07-31 21:52:19.361666');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2255, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785534753956, '2026-07-31 21:52:33.960683');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2256, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785535294019, '2026-07-31 22:01:34.021886');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2257, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785535339025, '2026-07-31 22:02:19.027287');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2258, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785535390680, '2026-07-31 22:03:10.70885');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2259, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785535816289, '2026-07-31 22:10:16.334033');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2260, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785536117827, '2026-07-31 22:15:17.828267');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2261, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785536602830, '2026-07-31 22:23:22.831004');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2262, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785537090791, '2026-07-31 22:31:30.792864');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2263, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785537092091, '2026-07-31 22:31:32.093672');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2264, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785537096641, '2026-07-31 22:31:36.641534');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2265, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785537111865, '2026-07-31 22:31:51.86636');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2266, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785537225917, '2026-07-31 22:33:45.918775');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2267, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785537239906, '2026-07-31 22:33:59.906895');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2268, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785876290236, '2026-08-04 20:44:50.237556');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2269, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785876301581, '2026-08-04 20:45:01.587535');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2270, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785876312024, '2026-08-04 20:45:12.025244');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2271, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785876322450, '2026-08-04 20:45:22.456839');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2272, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785876328295, '2026-08-04 20:45:28.297137');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2273, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785876345201, '2026-08-04 20:45:45.202102');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2274, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785876352694, '2026-08-04 20:45:52.695076');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2275, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785876382193, '2026-08-04 20:46:22.193791');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2276, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877421738, '2026-08-04 21:03:41.739587');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2277, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877431726, '2026-08-04 21:03:51.728301');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2278, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877434322, '2026-08-04 21:03:54.327701');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2279, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877438429, '2026-08-04 21:03:58.433682');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2280, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877439991, '2026-08-04 21:03:59.992311');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2281, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877444670, '2026-08-04 21:04:04.678168');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2282, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877448811, '2026-08-04 21:04:08.812614');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2283, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877525949, '2026-08-04 21:05:25.951804');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2284, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877761409, '2026-08-04 21:09:21.440229');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2285, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785877769303, '2026-08-04 21:09:29.307498');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2286, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785878324691, '2026-08-04 21:18:44.692389');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2287, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785878755755, '2026-08-04 21:25:55.756482');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2288, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785878928181, '2026-08-04 21:28:48.182056');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2289, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785878931542, '2026-08-04 21:28:51.54809');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2290, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785878933185, '2026-08-04 21:28:53.186786');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2291, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785878954251, '2026-08-04 21:29:14.251946');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2292, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785878974705, '2026-08-04 21:29:34.708221');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2293, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785879169593, '2026-08-04 21:32:49.593696');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2294, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785879178989, '2026-08-04 21:32:59.00398');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2326, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785964107529, '2026-08-05 21:08:27.531423');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2327, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785964113027, '2026-08-05 21:08:33.029359');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2328, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785964116276, '2026-08-05 21:08:36.336895');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2329, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785964128198, '2026-08-05 21:08:48.200012');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2330, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785964130243, '2026-08-05 21:08:50.245432');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2331, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785964135207, '2026-08-05 21:08:55.208571');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2332, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785964138046, '2026-08-05 21:08:58.049213');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2333, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1785964141245, '2026-08-05 21:09:01.245661');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2359, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043374002, '2026-08-06 19:09:34.00325');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2360, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043383931, '2026-08-06 19:09:43.933335');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2361, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043426357, '2026-08-06 19:10:26.358256');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2362, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043433048, '2026-08-06 19:10:33.049645');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2363, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043437203, '2026-08-06 19:10:37.205808');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2364, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043441801, '2026-08-06 19:10:41.803278');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2365, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043445224, '2026-08-06 19:10:45.225846');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2366, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043449042, '2026-08-06 19:10:49.043477');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2367, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043549826, '2026-08-06 19:12:29.829072');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2368, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043630329, '2026-08-06 19:13:50.331115');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2369, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043634823, '2026-08-06 19:13:54.825839');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2370, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043637325, '2026-08-06 19:13:57.325909');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2371, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043641293, '2026-08-06 19:14:01.295828');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2372, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043685524, '2026-08-06 19:14:45.527176');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2373, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043686631, '2026-08-06 19:14:46.632619');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2374, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043687663, '2026-08-06 19:14:47.666049');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2375, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043688738, '2026-08-06 19:14:48.739242');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2376, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043689639, '2026-08-06 19:14:49.640158');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2377, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786043702520, '2026-08-06 19:15:02.521547');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2378, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786044047972, '2026-08-06 19:20:48.002741');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2379, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786044179846, '2026-08-06 19:22:59.876141');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2380, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786044245489, '2026-08-06 19:24:05.523052');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2381, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786044905684, '2026-08-06 19:35:05.7022');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2382, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786045845610, '2026-08-06 19:50:45.612185');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2383, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046350966, '2026-08-06 19:59:10.991474');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2384, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046376596, '2026-08-06 19:59:36.597744');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2385, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046402309, '2026-08-06 20:00:02.310392');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2386, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046457922, '2026-08-06 20:00:57.95372');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2387, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046485994, '2026-08-06 20:01:25.995505');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2388, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046527708, '2026-08-06 20:02:07.732339');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2389, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046556470, '2026-08-06 20:02:36.473409');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2390, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046579565, '2026-08-06 20:02:59.566491');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2391, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046899913, '2026-08-06 20:08:19.913818');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2392, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786046954509, '2026-08-06 20:09:14.535727');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2393, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786047355917, '2026-08-06 20:15:55.93729');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2394, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786047367295, '2026-08-06 20:16:07.296815');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2395, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786047374223, '2026-08-06 20:16:14.225254');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2396, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786047377652, '2026-08-06 20:16:17.658609');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2397, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786047387205, '2026-08-06 20:16:27.20847');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2398, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786047391772, '2026-08-06 20:16:31.773568');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2430, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786126161799, '2026-08-07 18:09:21.880098');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2431, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128061398, '2026-08-07 18:41:01.399961');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2432, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128083144, '2026-08-07 18:41:23.144837');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2433, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128089060, '2026-08-07 18:41:29.061312');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2434, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128099733, '2026-08-07 18:41:39.734396');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2435, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128103808, '2026-08-07 18:41:43.809227');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2436, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128112601, '2026-08-07 18:41:52.603702');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2437, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128116989, '2026-08-07 18:41:56.990954');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2438, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128122299, '2026-08-07 18:42:02.300458');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2439, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128126231, '2026-08-07 18:42:06.232658');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2440, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128128329, '2026-08-07 18:42:08.330708');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2441, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128134791, '2026-08-07 18:42:14.792024');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2442, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128143616, '2026-08-07 18:42:23.620043');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2443, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128151989, '2026-08-07 18:42:31.990595');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2444, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128156540, '2026-08-07 18:42:36.541722');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2445, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128198921, '2026-08-07 18:43:18.921977');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2446, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128225040, '2026-08-07 18:43:45.040935');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2447, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128247282, '2026-08-07 18:44:07.283492');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2448, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128261913, '2026-08-07 18:44:21.913828');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2449, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128300202, '2026-08-07 18:45:00.203267');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2450, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128333798, '2026-08-07 18:45:33.825589');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2451, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128344440, '2026-08-07 18:45:44.442015');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2452, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128391623, '2026-08-07 18:46:31.631561');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2453, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128411926, '2026-08-07 18:46:51.929264');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2454, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128415574, '2026-08-07 18:46:55.57517');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2455, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128424989, '2026-08-07 18:47:04.990452');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2456, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128440158, '2026-08-07 18:47:20.162848');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2457, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128474736, '2026-08-07 18:47:54.736941');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2458, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786128524870, '2026-08-07 18:48:44.901749');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2459, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134653637, '2026-08-07 20:30:53.638027');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2460, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134722633, '2026-08-07 20:32:02.633888');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2461, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134763197, '2026-08-07 20:32:43.198141');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2462, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134838029, '2026-08-07 20:33:58.030513');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2463, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134852745, '2026-08-07 20:34:12.746133');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2464, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134884124, '2026-08-07 20:34:44.146839');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2465, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134891493, '2026-08-07 20:34:51.495444');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2466, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134897726, '2026-08-07 20:34:57.72673');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2467, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134903686, '2026-08-07 20:35:03.687337');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2468, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134910701, '2026-08-07 20:35:10.702662');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2469, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786134952996, '2026-08-07 20:35:53.024441');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2500, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786138650148, '2026-08-07 21:37:30.163675');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2501, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786138651112, '2026-08-07 21:37:31.113493');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2502, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786138654297, '2026-08-07 21:37:34.303967');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2503, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786138673537, '2026-08-07 21:37:53.538396');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2504, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786138677633, '2026-08-07 21:37:57.637675');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2505, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786138680104, '2026-08-07 21:38:00.105187');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2506, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786138683341, '2026-08-07 21:38:03.341933');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2507, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786139637547, '2026-08-07 21:53:57.563445');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2508, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786139647923, '2026-08-07 21:54:07.926367');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2509, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786139668185, '2026-08-07 21:54:28.190131');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2510, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786142579983, '2026-08-07 22:42:59.987219');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2511, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786142640817, '2026-08-07 22:44:00.817734');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2512, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1786143191148, '2026-08-07 22:53:11.149393');

-- ----------------------------
-- Table structure for tbl_provider
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_provider";
CREATE TABLE "public"."tbl_provider" (
  "cd_provider" int2 NOT NULL,
  "ds_provider" varchar(50) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of tbl_provider
-- ----------------------------
INSERT INTO "public"."tbl_provider" VALUES (1, 'whatsapp');
INSERT INTO "public"."tbl_provider" VALUES (2, 'telegram');

-- ----------------------------
-- Table structure for tbl_setor
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_setor";
CREATE TABLE "public"."tbl_setor" (
  "id_setor" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_setor" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "ds_setor" text COLLATE "pg_catalog"."default",
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_setor
-- ----------------------------
INSERT INTO "public"."tbl_setor" VALUES ('55aac717-08f0-466f-822f-b973fc5e2cc3', 'teste2', 'setor criado para testar o formulario', NULL, '2026-07-10 17:50:04.256001', '2026-07-10 17:50:04.256001', '2026-07-10 18:54:01.272086', 't');
INSERT INTO "public"."tbl_setor" VALUES ('af3e6d6d-8853-435c-bf02-48cf003fcecf', 'HUMANO', NULL, NULL, '2026-07-09 19:02:59.368964', '2026-07-09 19:02:59.37654', NULL, 'f');
INSERT INTO "public"."tbl_setor" VALUES ('11111111-1111-1111-1111-111111111111', 'CHATBOT', NULL, NULL, '2026-07-09 19:02:59.368964', '2026-07-09 19:02:59.37654', NULL, 'f');
INSERT INTO "public"."tbl_setor" VALUES ('22222222-2222-2222-2222-222222222222', 'IA', NULL, NULL, '2026-07-09 19:02:59.368964', '2026-07-09 19:02:59.37654', NULL, 'f');
INSERT INTO "public"."tbl_setor" VALUES ('00000000-0000-0000-0000-000000000000', 'CADASTRO', NULL, NULL, '2026-07-09 19:02:59.368964', '2026-08-06 19:51:02.334402', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_setor_horario
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_setor_horario";
CREATE TABLE "public"."tbl_setor_horario" (
  "id_setor_horario" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_setor" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "nu_dia_semana" int2 NOT NULL,
  "hr_inicial" time(6) NOT NULL,
  "hr_final" time(6) NOT NULL,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_setor_horario
-- ----------------------------
INSERT INTO "public"."tbl_setor_horario" VALUES ('633825c2-01aa-41a0-9ec8-f4b71e6f5fc0', '00000000-0000-0000-0000-000000000000', 2, '08:00:00', '13:00:00', NULL, '2026-08-06 19:51:02.351362', '2026-08-06 19:51:02.351362', NULL, 'f');
INSERT INTO "public"."tbl_setor_horario" VALUES ('88890b18-3a5b-4ecc-9fc8-f907aa4dacd3', '00000000-0000-0000-0000-000000000000', 2, '14:00:00', '18:00:00', NULL, '2026-08-06 19:51:02.372301', '2026-08-06 19:51:02.372301', NULL, 'f');

-- ----------------------------
-- Table structure for tbl_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_status";
CREATE TABLE "public"."tbl_status" (
  "cd_status" int2 NOT NULL,
  "ds_status" varchar(50) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of tbl_status
-- ----------------------------
INSERT INTO "public"."tbl_status" VALUES (1, 'INATIVO');
INSERT INTO "public"."tbl_status" VALUES (2, 'ATIVO');
INSERT INTO "public"."tbl_status" VALUES (3, 'DESCONECTADO');

-- ----------------------------
-- Table structure for tbl_usuario
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_usuario";
CREATE TABLE "public"."tbl_usuario" (
  "id_usuario" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_usuario" varchar(150) COLLATE "pg_catalog"."default" NOT NULL,
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "gn_email" varchar(150) COLLATE "pg_catalog"."default",
  "gn_senha" text COLLATE "pg_catalog"."default",
  "is_lembrar" bool
)
;

-- ----------------------------
-- Records of tbl_usuario
-- ----------------------------
INSERT INTO "public"."tbl_usuario" VALUES ('e7f42cf3-ab23-492a-865f-4f4e6593918c', 'master', 'eaceafa4-8ceb-47fa-bce5-aafc0787f70f', 'caetanolaraleal@gmail.com', '$2b$10$KxKmnJECg0qZ0tNoyLy1ReIb5Hq8TeRMeqjllZvdeSEu5.eywgIQm', 'f');

-- ----------------------------
-- Table structure for tbl_utilizador
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_utilizador";
CREATE TABLE "public"."tbl_utilizador" (
  "id_utilizador" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_utilizador" varchar(100) COLLATE "pg_catalog"."default",
  "nu_telefone" varchar(20) COLLATE "pg_catalog"."default",
  "cd_whatsapp" varchar(50) COLLATE "pg_catalog"."default",
  "cd_telegram" varchar(50) COLLATE "pg_catalog"."default",
  "nu_sessao" char(36) COLLATE "pg_catalog"."default",
  "dh_inclusao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_alteracao" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dh_exclusao" timestamp(6),
  "is_excluido" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of tbl_utilizador
-- ----------------------------
INSERT INTO "public"."tbl_utilizador" VALUES ('624685c7-c4d4-4a4a-a2bf-6039b93a92d6', 'Josi Lara', '559182080606', '559182080606', NULL, NULL, '2026-08-07 22:43:00.029856', '2026-08-07 22:43:00.029856', NULL, 'f');

-- ----------------------------
-- Function structure for aud_alteracao
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."aud_alteracao"();
CREATE FUNCTION "public"."aud_alteracao"()
  RETURNS "pg_catalog"."int2" AS $BODY$
BEGIN
	RETURN 2;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for aud_autorizacao
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."aud_autorizacao"();
CREATE FUNCTION "public"."aud_autorizacao"()
  RETURNS "pg_catalog"."int2" AS $BODY$
BEGIN
	RETURN 5;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for aud_exclusao
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."aud_exclusao"();
CREATE FUNCTION "public"."aud_exclusao"()
  RETURNS "pg_catalog"."int2" AS $BODY$
BEGIN
	RETURN 3;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for aud_finalizacao
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."aud_finalizacao"();
CREATE FUNCTION "public"."aud_finalizacao"()
  RETURNS "pg_catalog"."int2" AS $BODY$
BEGIN
	RETURN 4;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for aud_inclusao
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."aud_inclusao"();
CREATE FUNCTION "public"."aud_inclusao"()
  RETURNS "pg_catalog"."int2" AS $BODY$
BEGIN
	RETURN 1;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for aud_login
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."aud_login"();
CREATE FUNCTION "public"."aud_login"()
  RETURNS "pg_catalog"."int2" AS $BODY$
BEGIN
	RETURN 7;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for aud_recuperacao
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."aud_recuperacao"();
CREATE FUNCTION "public"."aud_recuperacao"()
  RETURNS "pg_catalog"."int2" AS $BODY$
BEGIN
	RETURN 6;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_add_menu
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_add_menu"("p_cd_menu" int4, "p_frm_codigo" int4, "p_cd_menu_pai" int4, "p_no_menu" varchar, "p_is_ativo" bool, "p_gn_funcao" varchar);
CREATE FUNCTION "public"."fn_add_menu"("p_cd_menu" int4, "p_frm_codigo" int4, "p_cd_menu_pai" int4, "p_no_menu" varchar, "p_is_ativo" bool=false, "p_gn_funcao" varchar=''::character varying)
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
  COST 100;

-- ----------------------------
-- Function structure for fn_adm_menu
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_adm_menu"();
CREATE FUNCTION "public"."fn_adm_menu"()
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
  COST 100;

-- ----------------------------
-- Function structure for fn_auditoria_insert
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_auditoria_insert"("p_no_tabela" name, "p_nu_sessao" bpchar, "p_gn_where" varchar, "p_gn_order" varchar);
CREATE FUNCTION "public"."fn_auditoria_insert"("p_no_tabela" name, "p_nu_sessao" bpchar, "p_gn_where" varchar, "p_gn_order" varchar)
  RETURNS "pg_catalog"."void" AS $BODY$

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
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_acao
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_acao"("p_cd_acao" int2);
CREATE FUNCTION "public"."fn_ret_acao"("p_cd_acao" int2)
  RETURNS "pg_catalog"."varchar" AS $BODY$

DECLARE
    v_return                    VARCHAR(15)     := CASE p_cd_acao
                                                        WHEN aud_inclusao()     THEN 'INCLUSÃO'
                                                        WHEN aud_alteracao()    THEN 'ALTERAÇÃO'
                                                        WHEN aud_exclusao()     THEN 'EXCLUSÃO'
                                                        WHEN aud_finalizacao()  THEN 'FINALIZAÇÃO'
                                                        WHEN aud_autorizacao()  THEN 'AUTORIZAÇÃO'
                                                        WHEN aud_recuperacao()  THEN 'RECUPERAÇÃO'
                                                        WHEN aud_login()        THEN 'LOGIN'
                                                        ELSE 'NÃO DEFINIDO'
                                                    END;

BEGIN
    --  RETURN
    RETURN v_return;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_ds_campo
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_ds_campo"("p_no_tabela" varchar, "p_no_campo" varchar);
CREATE FUNCTION "public"."fn_ret_ds_campo"("p_no_tabela" varchar, "p_no_campo" varchar)
  RETURNS "pg_catalog"."varchar" AS $BODY$

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
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_file_extrair
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_file_extrair"("p_no_arquivo" varchar, "p_is_diretorio" bool);
CREATE FUNCTION "public"."fn_ret_file_extrair"("p_no_arquivo" varchar, "p_is_diretorio" bool)
  RETURNS "pg_catalog"."varchar" AS $BODY$

DECLARE
    v_nu_posicao                            SMALLINT        := 0;
    v_gn_auxiliar                           VARCHAR(8000)   := p_no_arquivo;
    v_gn_diretorio                          VARCHAR(8000)   := '';
    v_ic_diretorio                          CHAR(1)         := CASE WHEN STRPOS(p_no_arquivo, '\') > 0  THEN '\'
                                                                    WHEN STRPOS(p_no_arquivo, '/') > 0  THEN '/'
                                                                    ELSE ''
                                                                END;

BEGIN

----------------------------------------------------------------------------------------------------
-- PROCESSA ARQUIVO
----------------------------------------------------------------------------------------------------
    IF v_ic_diretorio = '' THEN
        IF p_is_diretorio THEN
            v_gn_auxiliar = '';
        END IF;
    ELSE
        v_nu_posicao  = STRPOS(v_gn_auxiliar, v_ic_diretorio);
        WHILE v_nu_posicao <> 0 LOOP
            v_gn_diretorio = v_gn_diretorio || LEFT(v_gn_auxiliar, v_nu_posicao);
            v_gn_auxiliar  = RIGHT(v_gn_auxiliar, LENGTH(v_gn_auxiliar) - v_nu_posicao);
            v_nu_posicao   = STRPOS(v_gn_auxiliar, v_ic_diretorio);
        END LOOP;
        IF p_is_diretorio THEN 
            v_gn_auxiliar = v_gn_diretorio;
        END IF;
    END IF;
    
--------------------------------------------------
-- RETORNO
--------------------------------------------------
	RETURN v_gn_auxiliar;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_lower
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_lower"(text);
CREATE FUNCTION "public"."fn_ret_lower"(text)
  RETURNS "pg_catalog"."text" AS $BODY$SELECT TRANSLATE(LOWER($1)
									  ,TEXT 'ÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÄËÏÖÜÇ'
										,TEXT 'áéíóúàèìòùãõâêîôôäëïöüç')$BODY$
  LANGUAGE sql VOLATILE STRICT
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_moeda
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_moeda"("p_vl_moeda" numeric, "p_qt_decimais" int4);
CREATE FUNCTION "public"."fn_ret_moeda"("p_vl_moeda" numeric, "p_qt_decimais" int4=2)
  RETURNS "pg_catalog"."varchar" AS $BODY$

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
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_normal
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_normal"("p_gn_string" text, "p_is_acento" bool);
CREATE FUNCTION "public"."fn_ret_normal"("p_gn_string" text, "p_is_acento" bool)
  RETURNS "pg_catalog"."text" AS $BODY$

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
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_numerico
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_numerico"("p_gn_valor" varchar);
CREATE FUNCTION "public"."fn_ret_numerico"("p_gn_valor" varchar)
  RETURNS "pg_catalog"."varchar" AS $BODY$

DECLARE
 v_return														VARCHAR(1000)			:= '';

BEGIN

--------------------------------------------------------------------------------------------------------------
--	FORMATANDO VALOR
--------------------------------------------------------------------------------------------------------------
	v_return = regexp_replace(p_gn_valor, '[^0-9]', '', 'gi');
	
--------------------------------------------------------------------------------------------------------------
--	RETORNO
--------------------------------------------------------------------------------------------------------------
	RETURN v_return;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_numero_emb
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_numero_emb"("p_nu_embalagem" numeric);
CREATE FUNCTION "public"."fn_ret_numero_emb"("p_nu_embalagem" numeric)
  RETURNS "pg_catalog"."varchar" AS $BODY$

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
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_space
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_space"("p_gn_string" text, "p_gn_caractere" text, "p_nu_tamanho" int4, "p_is_esquerda" bool);
CREATE FUNCTION "public"."fn_ret_space"("p_gn_string" text, "p_gn_caractere" text, "p_nu_tamanho" int4, "p_is_esquerda" bool)
  RETURNS "pg_catalog"."text" AS $BODY$

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
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_upper
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_upper"(text);
CREATE FUNCTION "public"."fn_ret_upper"(text)
  RETURNS "pg_catalog"."text" AS $BODY$SELECT TRANSLATE(UPPER($1)
									  ,TEXT 'áéíóúàèìòùãõâêîôôäëïöüç'
										,TEXT 'ÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÄËÏÖÜÇ')$BODY$
  LANGUAGE sql VOLATILE STRICT
  COST 100;

-- ----------------------------
-- Function structure for fn_ret_zero
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_ret_zero"("p_gn_string" varchar, "p_nu_tamanho" int4);
CREATE FUNCTION "public"."fn_ret_zero"("p_gn_string" varchar, "p_nu_tamanho" int4)
  RETURNS "pg_catalog"."varchar" AS $BODY$

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
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_trg_a_i_fr_usuario
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_trg_a_i_fr_usuario"();
CREATE FUNCTION "public"."fn_trg_a_i_fr_usuario"()
  RETURNS "pg_catalog"."trigger" AS $BODY$

DECLARE
	v_sis_codigo							VARCHAR(3)		= 'ERP';

BEGIN
	-- OPERAÇÃO INSERT
	IF SUBSTRING(TG_OP, 1, 1) = 'I' THEN
	
		-- DEFINIR SERNHA '1234'
		UPDATE fr_usuario
			 SET usr_senha	= MD5(CAST(NEW.usr_codigo AS VARCHAR) || '1234')
		 WHERE usr_codigo	= NEW.usr_codigo;

		-- VERIFICA SE EXISTE fr_grupo
		IF NOT EXISTS(SELECT * FROM fr_grupo WHERE grp_codigo = 1 AND sis_codigo = v_sis_codigo) THEN
			INSERT INTO fr_grupo (grp_codigo, sis_codigo, grp_nome, grp_filtro_dicionario)
			  VALUES (1, v_sis_codigo, 'PRINCIPAL', '');
		END IF;
		
		-- INSERE fr_usuario_grupo
		INSERT INTO fr_usuario_grupo (grp_codigo, sis_codigo, usr_codigo)
			VALUES (1, v_sis_codigo, NEW.usr_codigo);
			
		-- INSERE fr_usuario_sistema
		INSERT INTO fr_usuario_sistema (usr_codigo, sis_codigo, uss_acesso_externo, uss_administrador, uss_acesso_maker, uss_criar_formulario, uss_criar_relatorio, uss_acessar, uss_criar_regra)
		  VALUES (NEW.usr_codigo, v_sis_codigo, 'N', 'N', 'N', 'N', 'N', 'S', 'N');
 
	END IF;

  RETURN NULL;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_update_timestamp
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_update_timestamp"();
CREATE FUNCTION "public"."fn_update_timestamp"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
   NEW.dt_update_at = NOW();
   RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_valida_ia_unica_por_setor
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."fn_valida_ia_unica_por_setor"();
CREATE FUNCTION "public"."fn_valida_ia_unica_por_setor"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
DECLARE
  eh_ia boolean;
  ja_existe boolean;
BEGIN
  SELECT is_ia INTO eh_ia
  FROM tbl_atendente
  WHERE id_atendente = NEW.id_atendente;

  IF eh_ia THEN
    SELECT EXISTS (
      SELECT 1
      FROM tbl_atendente_setor ats
      INNER JOIN tbl_atendente a ON a.id_atendente = ats.id_atendente
      WHERE ats.id_setor = NEW.id_setor
        AND a.is_ia = true
        AND ats.id_atendente != NEW.id_atendente
        AND (ats.is_excluido = false OR ats.is_excluido IS NULL)
    ) INTO ja_existe;

    IF ja_existe THEN
      RAISE EXCEPTION 'Este setor já possui um atendente IA vinculado'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for maiusculas
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."maiusculas"(text);
CREATE FUNCTION "public"."maiusculas"(text)
  RETURNS "pg_catalog"."text" AS $BODY$
   SELECT translate( upper($1),
          text 'áéíóúàèìòùãõâêîôôäëïöüç',
          text 'ÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÄËÏÖÜÇ')$BODY$
  LANGUAGE sql VOLATILE STRICT
  COST 100;

-- ----------------------------
-- Function structure for minusculas
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."minusculas"(text);
CREATE FUNCTION "public"."minusculas"(text)
  RETURNS "pg_catalog"."text" AS $BODY$
  SELECT translate( lower($1),
         text 'ÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÄËÏÖÜÇ',
         text 'áéíóúàèìòùãõâêîôôäëïöüç')$BODY$
  LANGUAGE sql VOLATILE STRICT
  COST 100;

-- ----------------------------
-- Function structure for retira_acentuacao
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."retira_acentuacao"("p_texto" text);
CREATE FUNCTION "public"."retira_acentuacao"("p_texto" text)
  RETURNS "pg_catalog"."text" AS $BODY$  
 Select translate($1,  
 'áàâãäåaÁÂÃÄÅAÀéèêëeÉÈÊËìíîïìiÌÍÎÏÌIóôõöoòÒÓÔÕÖOùúûüuÙÚÛÜUçÇñÑýÝ',  
 'aaaaaaaAAAAAAAeeeeeEEEEiiiiiiIIIIIIooooooOOOOOOuuuuuUUUUUcCnNyY'   
  );  
 $BODY$
  LANGUAGE sql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for unaccent
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent"(text);
CREATE FUNCTION "public"."unaccent"(text)
  RETURNS "pg_catalog"."text" AS '$libdir/unaccent', 'unaccent_dict'
  LANGUAGE c STABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for unaccent
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent"(regdictionary, text);
CREATE FUNCTION "public"."unaccent"(regdictionary, text)
  RETURNS "pg_catalog"."text" AS '$libdir/unaccent', 'unaccent_dict'
  LANGUAGE c STABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for unaccent_init
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent_init"(internal);
CREATE FUNCTION "public"."unaccent_init"(internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/unaccent', 'unaccent_init'
  LANGUAGE c VOLATILE
  COST 1;

-- ----------------------------
-- Function structure for unaccent_lexize
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent_lexize"(internal, internal, internal, internal);
CREATE FUNCTION "public"."unaccent_lexize"(internal, internal, internal, internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/unaccent', 'unaccent_lexize'
  LANGUAGE c VOLATILE
  COST 1;

-- ----------------------------
-- Function structure for uuid_equal_varchar
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_equal_varchar"("i" uuid, "s" varchar);
CREATE FUNCTION "public"."uuid_equal_varchar"("i" uuid, "s" varchar)
  RETURNS "pg_catalog"."bool" AS $BODY$SELECT CAST($1 AS VARCHAR) = $2$BODY$
  LANGUAGE sql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for uuid_generate_v1
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v1"();
CREATE FUNCTION "public"."uuid_generate_v1"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v1'
  LANGUAGE c VOLATILE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_generate_v1mc
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v1mc"();
CREATE FUNCTION "public"."uuid_generate_v1mc"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v1mc'
  LANGUAGE c VOLATILE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_generate_v3
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v3"("namespace" uuid, "name" text);
CREATE FUNCTION "public"."uuid_generate_v3"("namespace" uuid, "name" text)
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v3'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_generate_v4
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v4"();
CREATE FUNCTION "public"."uuid_generate_v4"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v4'
  LANGUAGE c VOLATILE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_generate_v5
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v5"("namespace" uuid, "name" text);
CREATE FUNCTION "public"."uuid_generate_v5"("namespace" uuid, "name" text)
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v5'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_nil
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_nil"();
CREATE FUNCTION "public"."uuid_nil"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_nil'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_ns_dns
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_ns_dns"();
CREATE FUNCTION "public"."uuid_ns_dns"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_ns_dns'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_ns_oid
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_ns_oid"();
CREATE FUNCTION "public"."uuid_ns_oid"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_ns_oid'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_ns_url
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_ns_url"();
CREATE FUNCTION "public"."uuid_ns_url"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_ns_url'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for uuid_ns_x500
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_ns_x500"();
CREATE FUNCTION "public"."uuid_ns_x500"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_ns_x500'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tbl_instancia_id_instancia_seq"
OWNED BY "public"."tbl_instancia"."id_instancia";
SELECT setval('"public"."tbl_instancia_id_instancia_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."tbl_mensagem_telegram_id_seq"', 51, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."tbl_mensagem_whatsapp_id_seq"', 2512, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tbl_provider_cd_provider_seq"
OWNED BY "public"."tbl_provider"."cd_provider";
SELECT setval('"public"."tbl_provider_cd_provider_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tbl_status_cd_status_seq"
OWNED BY "public"."tbl_status"."cd_status";
SELECT setval('"public"."tbl_status_cd_status_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."telegram_messages_id_seq"', 1, false);

-- ----------------------------
-- Primary Key structure for table tbl_atalho
-- ----------------------------
ALTER TABLE "public"."tbl_atalho" ADD CONSTRAINT "tbl_atalho_pkey" PRIMARY KEY ("id_atalho");

-- ----------------------------
-- Primary Key structure for table tbl_atendente
-- ----------------------------
ALTER TABLE "public"."tbl_atendente" ADD CONSTRAINT "tbl_atendente_pkey" PRIMARY KEY ("id_atendente");

-- ----------------------------
-- Triggers structure for table tbl_atendente_setor
-- ----------------------------
CREATE TRIGGER "trg_valida_ia_unica_por_setor" BEFORE INSERT OR UPDATE ON "public"."tbl_atendente_setor"
FOR EACH ROW
EXECUTE PROCEDURE "public"."fn_valida_ia_unica_por_setor"();

-- ----------------------------
-- Primary Key structure for table tbl_atendente_setor
-- ----------------------------
ALTER TABLE "public"."tbl_atendente_setor" ADD CONSTRAINT "tbl_atendente_setor_pkey" PRIMARY KEY ("id_atendente_setor");

-- ----------------------------
-- Primary Key structure for table tbl_campo
-- ----------------------------
ALTER TABLE "public"."tbl_campo" ADD CONSTRAINT "tbl_campo_personalizado_pkey" PRIMARY KEY ("id_campo");

-- ----------------------------
-- Primary Key structure for table tbl_campo_tipo
-- ----------------------------
ALTER TABLE "public"."tbl_campo_tipo" ADD CONSTRAINT "tbl_campo_personalizado_tipo_pkey" PRIMARY KEY ("cd_campo_tipo");

-- ----------------------------
-- Uniques structure for table tbl_chat
-- ----------------------------
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "uq_chat_unica" UNIQUE ("id_utilizador", "cd_provider", "id_instancia");

-- ----------------------------
-- Primary Key structure for table tbl_chat
-- ----------------------------
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "tbl_chat_pkey" PRIMARY KEY ("id_chat");

-- ----------------------------
-- Primary Key structure for table tbl_chat_status
-- ----------------------------
ALTER TABLE "public"."tbl_chat_status" ADD CONSTRAINT "tbl_chat_status_pkey" PRIMARY KEY ("sg_chat_status");

-- ----------------------------
-- Primary Key structure for table tbl_dia_semana
-- ----------------------------
ALTER TABLE "public"."tbl_dia_semana" ADD CONSTRAINT "tbl_dia_semana_pkey" PRIMARY KEY ("nu_dia_semana");

-- ----------------------------
-- Primary Key structure for table tbl_funil
-- ----------------------------
ALTER TABLE "public"."tbl_funil" ADD CONSTRAINT "tbl_funil_pkey" PRIMARY KEY ("id_funil");

-- ----------------------------
-- Primary Key structure for table tbl_funil_cadastro
-- ----------------------------
ALTER TABLE "public"."tbl_funil_cadastro" ADD CONSTRAINT "tbl_funil_cadastro_pkey" PRIMARY KEY ("id_funil_cadastro");

-- ----------------------------
-- Primary Key structure for table tbl_funil_cadastro_botao
-- ----------------------------
ALTER TABLE "public"."tbl_funil_cadastro_botao" ADD CONSTRAINT "tbl_funil_cadastro_botao_pkey" PRIMARY KEY ("id_funil_cadastro_botao");

-- ----------------------------
-- Primary Key structure for table tbl_funil_chatbot
-- ----------------------------
ALTER TABLE "public"."tbl_funil_chatbot" ADD CONSTRAINT "tbl_funil_chatbot_pkey" PRIMARY KEY ("id_funil_chatbot");

-- ----------------------------
-- Primary Key structure for table tbl_funil_chatbot_botao
-- ----------------------------
ALTER TABLE "public"."tbl_funil_chatbot_botao" ADD CONSTRAINT "tbl_funil_chatbot_botao_pkey" PRIMARY KEY ("id_funil_chatbot_botao");

-- ----------------------------
-- Primary Key structure for table tbl_funil_expiracao
-- ----------------------------
ALTER TABLE "public"."tbl_funil_expiracao" ADD CONSTRAINT "tbl_funil_expiracao_pkey" PRIMARY KEY ("id_funil_expiracao");

-- ----------------------------
-- Uniques structure for table tbl_funil_ia
-- ----------------------------
ALTER TABLE "public"."tbl_funil_ia" ADD CONSTRAINT "uq_funil_ia_funil_setor" UNIQUE ("id_funil", "id_setor");

-- ----------------------------
-- Primary Key structure for table tbl_funil_ia
-- ----------------------------
ALTER TABLE "public"."tbl_funil_ia" ADD CONSTRAINT "tbl_funil_ia_pkey" PRIMARY KEY ("id_funil_ia");

-- ----------------------------
-- Primary Key structure for table tbl_funil_ia_modelo
-- ----------------------------
ALTER TABLE "public"."tbl_funil_ia_modelo" ADD CONSTRAINT "tbl_funil_ia_modelo_pkey" PRIMARY KEY ("id_funil_ia_modelo");

-- ----------------------------
-- Indexes structure for table tbl_funil_utilizador
-- ----------------------------
CREATE UNIQUE INDEX "uq_tbl_funil_utilizador" ON "public"."tbl_funil_utilizador" USING btree (
  "id_funil" COLLATE "pg_catalog"."default" "pg_catalog"."bpchar_ops" ASC NULLS LAST,
  "id_utilizador" COLLATE "pg_catalog"."default" "pg_catalog"."bpchar_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table tbl_funil_utilizador
-- ----------------------------
ALTER TABLE "public"."tbl_funil_utilizador" ADD CONSTRAINT "tbl_funil_utilizador_pkey" PRIMARY KEY ("id_funil_utilizador");

-- ----------------------------
-- Indexes structure for table tbl_funil_utilizador_campo
-- ----------------------------
CREATE UNIQUE INDEX "uq_tbl_funil_utilizador_campo" ON "public"."tbl_funil_utilizador_campo" USING btree (
  "id_funil_utilizador" COLLATE "pg_catalog"."default" "pg_catalog"."bpchar_ops" ASC NULLS LAST,
  "id_campo" COLLATE "pg_catalog"."default" "pg_catalog"."bpchar_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table tbl_funil_utilizador_campo
-- ----------------------------
ALTER TABLE "public"."tbl_funil_utilizador_campo" ADD CONSTRAINT "tbl_funil_utilizador_campo_personalizado_pkey" PRIMARY KEY ("id_funil_utilizador_campo");

-- ----------------------------
-- Triggers structure for table tbl_instancia
-- ----------------------------
CREATE TRIGGER "tg_update_instancia_timestamp" BEFORE UPDATE ON "public"."tbl_instancia"
FOR EACH ROW
EXECUTE PROCEDURE "public"."fn_update_timestamp"();

-- ----------------------------
-- Primary Key structure for table tbl_instancia
-- ----------------------------
ALTER TABLE "public"."tbl_instancia" ADD CONSTRAINT "tbl_instancia_pkey" PRIMARY KEY ("id_instancia");

-- ----------------------------
-- Primary Key structure for table tbl_mensagem
-- ----------------------------
ALTER TABLE "public"."tbl_mensagem" ADD CONSTRAINT "tbl_mensagem_pkey" PRIMARY KEY ("id_mensagem");

-- ----------------------------
-- Uniques structure for table tbl_provider
-- ----------------------------
ALTER TABLE "public"."tbl_provider" ADD CONSTRAINT "tbl_provider_ds_provider_key" UNIQUE ("ds_provider");

-- ----------------------------
-- Primary Key structure for table tbl_provider
-- ----------------------------
ALTER TABLE "public"."tbl_provider" ADD CONSTRAINT "tbl_provider_pkey" PRIMARY KEY ("cd_provider");

-- ----------------------------
-- Primary Key structure for table tbl_setor
-- ----------------------------
ALTER TABLE "public"."tbl_setor" ADD CONSTRAINT "tbl_setor_pkey" PRIMARY KEY ("id_setor");

-- ----------------------------
-- Primary Key structure for table tbl_setor_horario
-- ----------------------------
ALTER TABLE "public"."tbl_setor_horario" ADD CONSTRAINT "tbl_setor_horario_pkey" PRIMARY KEY ("id_setor_horario");

-- ----------------------------
-- Uniques structure for table tbl_status
-- ----------------------------
ALTER TABLE "public"."tbl_status" ADD CONSTRAINT "tbl_status_ds_status_key" UNIQUE ("ds_status");

-- ----------------------------
-- Primary Key structure for table tbl_status
-- ----------------------------
ALTER TABLE "public"."tbl_status" ADD CONSTRAINT "tbl_status_pkey" PRIMARY KEY ("cd_status");

-- ----------------------------
-- Primary Key structure for table tbl_usuario
-- ----------------------------
ALTER TABLE "public"."tbl_usuario" ADD CONSTRAINT "tbl_usuario_pkey" PRIMARY KEY ("id_usuario");

-- ----------------------------
-- Primary Key structure for table tbl_utilizador
-- ----------------------------
ALTER TABLE "public"."tbl_utilizador" ADD CONSTRAINT "tbl_utilizador_pkey" PRIMARY KEY ("id_utilizador");

-- ----------------------------
-- Foreign Keys structure for table tbl_atendente_setor
-- ----------------------------
ALTER TABLE "public"."tbl_atendente_setor" ADD CONSTRAINT "fk_tbl_atendente_setor_tbl_atendente" FOREIGN KEY ("id_atendente") REFERENCES "public"."tbl_atendente" ("id_atendente") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_atendente_setor" ADD CONSTRAINT "fk_tbl_atendente_setor_tbl_setor" FOREIGN KEY ("id_setor") REFERENCES "public"."tbl_setor" ("id_setor") ON DELETE NO ACTION ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table tbl_campo
-- ----------------------------
ALTER TABLE "public"."tbl_campo" ADD CONSTRAINT "fk_tbl_campo_tbl_campo_tipo" FOREIGN KEY ("cd_campo_tipo") REFERENCES "public"."tbl_campo_tipo" ("cd_campo_tipo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_chat
-- ----------------------------
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "fk_chat_chat_status" FOREIGN KEY ("sg_chat_status") REFERENCES "public"."tbl_chat_status" ("sg_chat_status") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "fk_chat_instancia" FOREIGN KEY ("id_instancia") REFERENCES "public"."tbl_instancia" ("id_instancia") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "fk_chat_provider" FOREIGN KEY ("cd_provider") REFERENCES "public"."tbl_provider" ("cd_provider") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "fk_chat_utilizador" FOREIGN KEY ("id_utilizador") REFERENCES "public"."tbl_utilizador" ("id_utilizador") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_cadastro
-- ----------------------------
ALTER TABLE "public"."tbl_funil_cadastro" ADD CONSTRAINT "fk_tbl_funil_cadastro_tbl_campo" FOREIGN KEY ("id_campo") REFERENCES "public"."tbl_campo" ("id_campo") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_funil_cadastro" ADD CONSTRAINT "fk_tbl_funil_cadastro_tbl_funil" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_funil_cadastro" ADD CONSTRAINT "fk_tbl_funil_cadastro_tbl_setor" FOREIGN KEY ("id_setor") REFERENCES "public"."tbl_setor" ("id_setor") ON DELETE NO ACTION ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_cadastro_botao
-- ----------------------------
ALTER TABLE "public"."tbl_funil_cadastro_botao" ADD CONSTRAINT "fk_tbl_funil_cadastro_botao_tbl_funil_cadastro" FOREIGN KEY ("id_funil_cadastro") REFERENCES "public"."tbl_funil_cadastro" ("id_funil_cadastro") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_chatbot
-- ----------------------------
ALTER TABLE "public"."tbl_funil_chatbot" ADD CONSTRAINT "fk_tbl_funil_chatbot_tbl_campo" FOREIGN KEY ("id_campo") REFERENCES "public"."tbl_campo" ("id_campo") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_funil_chatbot" ADD CONSTRAINT "fk_tbl_funil_chatbot_tbl_funil" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_funil_chatbot" ADD CONSTRAINT "fk_tbl_funil_chatbot_tbl_setor" FOREIGN KEY ("id_setor") REFERENCES "public"."tbl_setor" ("id_setor") ON DELETE NO ACTION ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_chatbot_botao
-- ----------------------------
ALTER TABLE "public"."tbl_funil_chatbot_botao" ADD CONSTRAINT "fk_tbl_funil_chatbot_botao_tbl_funil_chatbot" FOREIGN KEY ("id_funil_chatbot") REFERENCES "public"."tbl_funil_chatbot" ("id_funil_chatbot") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_expiracao
-- ----------------------------
ALTER TABLE "public"."tbl_funil_expiracao" ADD CONSTRAINT "fk_tbl_funil_expiracao_tbl_funil" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_ia
-- ----------------------------
ALTER TABLE "public"."tbl_funil_ia" ADD CONSTRAINT "fk_tbl_funil_ia_tbl_funil_1" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_funil_ia" ADD CONSTRAINT "fk_tbl_funil_ia_tbl_funil_ia_modelo_2" FOREIGN KEY ("id_funil_ia_modelo") REFERENCES "public"."tbl_funil_ia_modelo" ("id_funil_ia_modelo") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_funil_ia" ADD CONSTRAINT "fk_tbl_funil_ia_tbl_setor" FOREIGN KEY ("id_setor") REFERENCES "public"."tbl_setor" ("id_setor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_utilizador
-- ----------------------------
ALTER TABLE "public"."tbl_funil_utilizador" ADD CONSTRAINT "fk_tbl_funil_utilizador_tbl_chat_status" FOREIGN KEY ("sg_chat_status") REFERENCES "public"."tbl_chat_status" ("sg_chat_status") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_funil_utilizador" ADD CONSTRAINT "fk_tbl_funil_utilizador_tbl_funil_1" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_funil_utilizador" ADD CONSTRAINT "fk_tbl_funil_utilizador_tbl_setor" FOREIGN KEY ("id_setor") REFERENCES "public"."tbl_setor" ("id_setor") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_funil_utilizador" ADD CONSTRAINT "fk_tbl_funil_utilizador_tbl_utilizador_2" FOREIGN KEY ("id_utilizador") REFERENCES "public"."tbl_utilizador" ("id_utilizador") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_utilizador_campo
-- ----------------------------
ALTER TABLE "public"."tbl_funil_utilizador_campo" ADD CONSTRAINT "fk_tbl_funil_utilizador_campo_tbl_campo" FOREIGN KEY ("id_campo") REFERENCES "public"."tbl_campo" ("id_campo") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_funil_utilizador_campo" ADD CONSTRAINT "fk_tbl_funil_utilizador_campo_tbl_funil_utilizador" FOREIGN KEY ("id_funil_utilizador") REFERENCES "public"."tbl_funil_utilizador" ("id_funil_utilizador") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_instancia
-- ----------------------------
ALTER TABLE "public"."tbl_instancia" ADD CONSTRAINT "fk_instancia_funil" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_instancia" ADD CONSTRAINT "fk_instancia_provider" FOREIGN KEY ("cd_provider") REFERENCES "public"."tbl_provider" ("cd_provider") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_instancia" ADD CONSTRAINT "fk_instancia_status" FOREIGN KEY ("cd_status") REFERENCES "public"."tbl_status" ("cd_status") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table tbl_mensagem
-- ----------------------------
ALTER TABLE "public"."tbl_mensagem" ADD CONSTRAINT "fk_mensagem_chat" FOREIGN KEY ("id_chat") REFERENCES "public"."tbl_chat" ("id_chat") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_mensagem" ADD CONSTRAINT "fk_mensagem_provider" FOREIGN KEY ("cd_provider") REFERENCES "public"."tbl_provider" ("cd_provider") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_mensagem" ADD CONSTRAINT "fk_tbl_mensagem_tbl_atendente" FOREIGN KEY ("id_atendente") REFERENCES "public"."tbl_atendente" ("id_atendente") ON DELETE NO ACTION ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table tbl_setor_horario
-- ----------------------------
ALTER TABLE "public"."tbl_setor_horario" ADD CONSTRAINT "fk_tbl_setor_horario_tbl_dia_semana" FOREIGN KEY ("nu_dia_semana") REFERENCES "public"."tbl_dia_semana" ("nu_dia_semana") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_setor_horario" ADD CONSTRAINT "fk_tbl_setor_horario_tbl_setor" FOREIGN KEY ("id_setor") REFERENCES "public"."tbl_setor" ("id_setor") ON DELETE NO ACTION ON UPDATE CASCADE;
