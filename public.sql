/*
 Navicat Premium Dump SQL

 Source Server         : chatbot
 Source Server Type    : PostgreSQL
 Source Server Version : 150014 (150014)
 Source Host           : localhost:5432
 Source Catalog        : chatbot
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 150014 (150014)
 File Encoding         : 65001

 Date: 27/02/2026 17:11:10
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
-- Table structure for tbl_botao
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_botao";
CREATE TABLE "public"."tbl_botao" (

)
;

-- ----------------------------
-- Records of tbl_botao
-- ----------------------------

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
  "dt_updated_at" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of tbl_chat
-- ----------------------------

-- ----------------------------
-- Table structure for tbl_funil
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil";
CREATE TABLE "public"."tbl_funil" (
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_funil" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "ds_funil" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tbl_funil
-- ----------------------------
INSERT INTO "public"."tbl_funil" VALUES ('e1e4748f-aa5b-4981-8694-81dc5aabde9c', 'teste', NULL);

-- ----------------------------
-- Table structure for tbl_funil_cadastro
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_cadastro";
CREATE TABLE "public"."tbl_funil_cadastro" (
  "id_funil_cadastro" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem" int2 NOT NULL,
  "ds_mensagem" text COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem_destino" int2,
  "is_aguardar" bool NOT NULL
)
;

-- ----------------------------
-- Records of tbl_funil_cadastro
-- ----------------------------
INSERT INTO "public"."tbl_funil_cadastro" VALUES ('dc8b0fc7-7e6f-4ac2-a187-7425c407235c', 'e1e4748f-aa5b-4981-8694-81dc5aabde9c', 1, 'mensagem de bem vindo', 2, 't');

-- ----------------------------
-- Table structure for tbl_funil_cadastro_botao
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_cadastro_botao";
CREATE TABLE "public"."tbl_funil_cadastro_botao" (
  "id_funil_cadastro_botao" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil_cadastro" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_botao" int2 NOT NULL,
  "ds_botao" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem_destino" int2
)
;

-- ----------------------------
-- Records of tbl_funil_cadastro_botao
-- ----------------------------
INSERT INTO "public"."tbl_funil_cadastro_botao" VALUES ('1bac609b-c203-445f-b511-a5879c1cfbde', 'dc8b0fc7-7e6f-4ac2-a187-7425c407235c', 1, 'opcao 1', 2);
INSERT INTO "public"."tbl_funil_cadastro_botao" VALUES ('2a7b155c-6e9a-465f-91d6-6c5133eb8517', 'dc8b0fc7-7e6f-4ac2-a187-7425c407235c', 2, 'opcao 2', 2);
INSERT INTO "public"."tbl_funil_cadastro_botao" VALUES ('af4ca289-e809-4e93-9269-dad9328354ad', 'dc8b0fc7-7e6f-4ac2-a187-7425c407235c', 3, 'opcao 3', 2);

-- ----------------------------
-- Table structure for tbl_funil_chatbot
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_chatbot";
CREATE TABLE "public"."tbl_funil_chatbot" (
  "id_funil_chatbot" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem" int4 NOT NULL,
  "ds_mensagem" text COLLATE "pg_catalog"."default",
  "cd_mensagem_destino" int4,
  "is_aguardar" bool NOT NULL
)
;

-- ----------------------------
-- Records of tbl_funil_chatbot
-- ----------------------------
INSERT INTO "public"."tbl_funil_chatbot" VALUES ('1f970863-23f0-45dd-bef6-fd75f9dd65db', 'e1e4748f-aa5b-4981-8694-81dc5aabde9c', 2, 'você veio direto da mensagem de boas vindas', 3, 't');
INSERT INTO "public"."tbl_funil_chatbot" VALUES ('a171ef36-33c1-413c-9b30-4f52a81582a9', 'e1e4748f-aa5b-4981-8694-81dc5aabde9c', 3, 'agora estamos batendo um papo', 4, 't');
INSERT INTO "public"."tbl_funil_chatbot" VALUES ('5202cbb4-1bab-494a-88ad-41709dbca024', 'e1e4748f-aa5b-4981-8694-81dc5aabde9c', 4, 'agora aprofundamos nosso papo', 5, 't');

-- ----------------------------
-- Table structure for tbl_funil_chatbot_botao
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_chatbot_botao";
CREATE TABLE "public"."tbl_funil_chatbot_botao" (
  "id_funil_chatbot_botao" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil_chatbot" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_botao" int2 NOT NULL,
  "ds_botao" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem_destino" int2
)
;

-- ----------------------------
-- Records of tbl_funil_chatbot_botao
-- ----------------------------
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('e88d0cae-d8c6-4a30-aef8-a6a83012dd16', '1f970863-23f0-45dd-bef6-fd75f9dd65db', 1, 'opção 1', 3);
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('fc4e10bc-05c6-446c-b852-52b20a4a526e', '1f970863-23f0-45dd-bef6-fd75f9dd65db', 2, 'opção 2', 3);
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('8ecd1241-8996-4536-a268-5880bd53c0b1', '1f970863-23f0-45dd-bef6-fd75f9dd65db', 3, 'opção 3', 3);
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('b1df8e93-8d16-4ee0-9960-9a99b84d0a1f', 'a171ef36-33c1-413c-9b30-4f52a81582a9', 1, 'opção 1', 4);
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('4005d522-d275-4ce8-9db7-73542117470f', 'a171ef36-33c1-413c-9b30-4f52a81582a9', 2, 'opção 2', 4);
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('8f08fc49-83f1-4777-819e-630802661be6', 'a171ef36-33c1-413c-9b30-4f52a81582a9', 3, 'opção 3', 4);
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('36b0960b-3537-4fff-b5f0-b2649107ca34', '5202cbb4-1bab-494a-88ad-41709dbca024', 1, 'opção 1', 2);
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('04fb1b9d-dec7-4b52-9532-58261c0e5602', '5202cbb4-1bab-494a-88ad-41709dbca024', 2, 'opção 2', 2);
INSERT INTO "public"."tbl_funil_chatbot_botao" VALUES ('e979fe09-24ee-471d-9011-09b6ee5670a2', '5202cbb4-1bab-494a-88ad-41709dbca024', 3, 'opção 3', 2);

-- ----------------------------
-- Table structure for tbl_funil_utilizador
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_funil_utilizador";
CREATE TABLE "public"."tbl_funil_utilizador" (
  "id_funil_utilizador" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_funil" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id_utilizador" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_mensagem_cadastro" int2,
  "cd_mensagem_chatbot" int2,
  "dh_mensagem" timestamp(6),
  "dh_expiracao" timestamp(6)
)
;

-- ----------------------------
-- Records of tbl_funil_utilizador
-- ----------------------------
INSERT INTO "public"."tbl_funil_utilizador" VALUES ('68c2ea99-3c54-46a5-a753-3c3374c293b1', 'e1e4748f-aa5b-4981-8694-81dc5aabde9c', 'd5f92959-f863-40a3-8f32-ed83f95cb0d9', 1, 0, '2026-02-20 20:16:39.298', '2026-02-27 20:16:39.298');
INSERT INTO "public"."tbl_funil_utilizador" VALUES ('7f832501-5356-47f6-b076-16bf49596390', 'e1e4748f-aa5b-4981-8694-81dc5aabde9c', '418f65f3-e753-461d-90b9-d23813956282', 1, 4, '2026-02-20 20:16:54.993212', '2026-02-27 20:15:50.338');

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
  "id_funil" char(36) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tbl_instancia
-- ----------------------------
INSERT INTO "public"."tbl_instancia" VALUES ('e7047c6b-833a-4404-afac-eafc66723ada', 'caetano_bot', 1, 3, NULL, NULL, 'http://api_mensagem:3001/webhook', NULL, '2026-02-27 19:41:33.758848', '2026-02-27 19:43:30.60039', '/usr/src/app/auth/731ab112-535e-4a51-b824-709c057fe102', 'e1e4748f-aa5b-4981-8694-81dc5aabde9c');

-- ----------------------------
-- Table structure for tbl_mensagem
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_mensagem";
CREATE TABLE "public"."tbl_mensagem" (
  "id_mensagem" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "id_chat" char(36) COLLATE "pg_catalog"."default" NOT NULL,
  "cd_provider" int2 NOT NULL,
  "id_mensagem_externa" varchar(150) COLLATE "pg_catalog"."default",
  "from_me" bool NOT NULL,
  "ds_conteudo" text COLLATE "pg_catalog"."default",
  "ds_tipo" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'text'::character varying,
  "ds_payload" jsonb,
  "dh_envio" timestamp(6) NOT NULL,
  "dt_created_at" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of tbl_mensagem
-- ----------------------------

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
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (1, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614671137, '2026-02-20 19:11:11.15357');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (2, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614673949, '2026-02-20 19:11:13.950989');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (3, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614699348, '2026-02-20 19:11:39.368717');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (4, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614715016, '2026-02-20 19:11:55.039889');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (5, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614758125, '2026-02-20 19:12:38.139476');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (6, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614792588, '2026-02-20 19:13:12.600277');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (7, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614796791, '2026-02-20 19:13:16.792214');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (8, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614804640, '2026-02-20 19:13:24.641153');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (9, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614811459, '2026-02-20 19:13:31.460003');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (10, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614837455, '2026-02-20 19:13:57.477821');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (11, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771614873834, '2026-02-20 19:14:33.855264');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (12, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771616396154, '2026-02-20 19:39:56.168739');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (13, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771616400061, '2026-02-20 19:40:00.062923');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (14, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771616406072, '2026-02-20 19:40:06.073923');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (15, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771616438416, '2026-02-20 19:40:38.427155');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (16, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771616954058, '2026-02-20 19:49:14.070191');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (49, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617166226, '2026-02-20 19:52:46.251416');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (50, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617477434, '2026-02-20 19:57:57.449906');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (51, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617910469, '2026-02-20 20:05:10.482833');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (52, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617911346, '2026-02-20 20:05:11.346915');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (53, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617918275, '2026-02-20 20:05:18.275496');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (54, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617919217, '2026-02-20 20:05:19.217726');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (55, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617920182, '2026-02-20 20:05:20.182941');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (56, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617921085, '2026-02-20 20:05:21.086363');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (57, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617922037, '2026-02-20 20:05:22.03783');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (58, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617922965, '2026-02-20 20:05:22.966182');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (59, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617923903, '2026-02-20 20:05:23.903873');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (60, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617924889, '2026-02-20 20:05:24.890319');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (61, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617925722, '2026-02-20 20:05:25.723264');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (62, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617926737, '2026-02-20 20:05:26.738518');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (63, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617927741, '2026-02-20 20:05:27.74267');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (64, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617928654, '2026-02-20 20:05:28.655742');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (65, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617929615, '2026-02-20 20:05:29.615986');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (66, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617930543, '2026-02-20 20:05:30.544433');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (67, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617931412, '2026-02-20 20:05:31.413885');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (68, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771617932315, '2026-02-20 20:05:32.315946');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (69, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618225093, '2026-02-20 20:10:25.113339');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (70, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618550302, '2026-02-20 20:15:50.318715');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (71, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618560930, '2026-02-20 20:16:00.957984');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (72, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618599265, '2026-02-20 20:16:39.281397');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (73, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618601233, '2026-02-20 20:16:41.234935');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (74, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618604508, '2026-02-20 20:16:44.508984');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (75, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618609855, '2026-02-20 20:16:49.855825');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (76, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618614974, '2026-02-20 20:16:54.975134');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (77, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618671292, '2026-02-20 20:17:51.309177');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (78, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618678469, '2026-02-20 20:17:58.469656');
INSERT INTO "public"."tbl_mensagem_whatsapp" VALUES (79, NULL, NULL, NULL, NULL, 'f', NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, 'f', NULL, 1771618684852, '2026-02-20 20:18:04.852803');

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
INSERT INTO "public"."tbl_status" VALUES (1, 'inativo');
INSERT INTO "public"."tbl_status" VALUES (2, 'ativo');
INSERT INTO "public"."tbl_status" VALUES (3, 'desconectado');

-- ----------------------------
-- Table structure for tbl_utilizador
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_utilizador";
CREATE TABLE "public"."tbl_utilizador" (
  "id_utilizador" char(36) COLLATE "pg_catalog"."default" NOT NULL DEFAULT uuid_generate_v4(),
  "no_utilizador" varchar(100) COLLATE "pg_catalog"."default",
  "nu_telefone" varchar(20) COLLATE "pg_catalog"."default",
  "cd_whatsapp" varchar(50) COLLATE "pg_catalog"."default",
  "cd_telegram" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tbl_utilizador
-- ----------------------------
INSERT INTO "public"."tbl_utilizador" VALUES ('418f65f3-e753-461d-90b9-d23813956282', NULL, '559181927478', '559181927478', NULL);
INSERT INTO "public"."tbl_utilizador" VALUES ('d5f92959-f863-40a3-8f32-ed83f95cb0d9', NULL, '559191729721', '559191729721', NULL);

-- ----------------------------
-- Table structure for telegram_messages
-- ----------------------------
DROP TABLE IF EXISTS "public"."telegram_messages";
CREATE TABLE "public"."telegram_messages" (
  "id" int4 NOT NULL DEFAULT nextval('telegram_messages_id_seq'::regclass),
  "message_id" int8 NOT NULL,
  "constructor_id" int8,
  "subclass_of_id" int8,
  "class_name" varchar(100) COLLATE "pg_catalog"."default",
  "class_type" varchar(50) COLLATE "pg_catalog"."default",
  "out" bool,
  "mentioned" bool,
  "media_unread" bool,
  "silent" bool,
  "ttl_period" int4,
  "fwd_from" jsonb,
  "via_bot_id" int8,
  "reply_to" jsonb,
  "date" timestamp(6),
  "message" text COLLATE "pg_catalog"."default",
  "media" jsonb,
  "reply_markup" jsonb,
  "entities" jsonb,
  "views" int4,
  "forwards" int4,
  "replies" jsonb,
  "edit_date" timestamp(6),
  "pinned" bool,
  "post_author" varchar(255) COLLATE "pg_catalog"."default",
  "grouped_id" int8,
  "restriction_reason" jsonb,
  "action" jsonb,
  "noforwards" bool,
  "reactions" jsonb,
  "flags" jsonb,
  "invert_media" bool,
  "flags2" jsonb,
  "offline" bool,
  "video_processing_pending" bool,
  "from_boosts_applied" bool,
  "saved_peer_id" int8,
  "via_business_bot_id" int8,
  "quick_reply_shortcut_id" int8,
  "effect" jsonb,
  "factcheck" jsonb,
  "report_delivery_until_date" timestamp(6),
  "from_user_id" int8,
  "peer_user_id" int8
)
;

-- ----------------------------
-- Records of telegram_messages
-- ----------------------------

-- ----------------------------
-- Table structure for telegram_users
-- ----------------------------
DROP TABLE IF EXISTS "public"."telegram_users";
CREATE TABLE "public"."telegram_users" (
  "user_id" int8 NOT NULL,
  "constructor_id" int8,
  "subclass_of_id" int8,
  "class_name" varchar(100) COLLATE "pg_catalog"."default",
  "class_type" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of telegram_users
-- ----------------------------

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
DROP FUNCTION IF EXISTS "public"."unaccent"(regdictionary, text);
CREATE FUNCTION "public"."unaccent"(regdictionary, text)
  RETURNS "pg_catalog"."text" AS '$libdir/unaccent', 'unaccent_dict'
  LANGUAGE c STABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for unaccent
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent"(text);
CREATE FUNCTION "public"."unaccent"(text)
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
-- View structure for vw_sys_table
-- ----------------------------
DROP VIEW IF EXISTS "public"."vw_sys_table";
CREATE VIEW "public"."vw_sys_table" AS  SELECT z.no_database,
    z.no_schema,
    z.is_view,
    z.no_tabela,
    z.no_campo,
    z.cd_coluna,
    z.no_tipo,
    z.nu_tamanho_maximo,
    z.nu_precisao,
    z.nu_escala,
    z.gn_tamanho_maximo,
    z.cd_pk_ordem <> 0 AS is_primary_key,
    z.cd_pk_ordem,
    z.cd_unique_ordem <> 0 AS is_unique,
    z.cd_unique_ordem,
    z.is_nullable,
    z.is_identity,
    z.is_numeric,
    z.is_text,
    z.is_date,
    z.is_image,
    z.is_currency,
    z.ic_where,
    z.ds_default,
    z.gn_default
   FROM ( SELECT a.table_catalog AS no_database,
            a.table_schema AS no_schema,
            a.table_type::text = 'VIEW'::text AS is_view,
            a.table_name AS no_tabela,
            b.column_name AS no_campo,
            b.ordinal_position AS cd_coluna,
            upper(b.udt_name::text) AS no_tipo,
            b.character_maximum_length AS nu_tamanho_maximo,
                CASE
                    WHEN b.udt_name::name = ANY (ARRAY['float4'::name, 'float8'::name, 'numeric'::name]) THEN b.numeric_precision::integer
                    ELSE NULL::integer
                END AS nu_precisao,
                CASE
                    WHEN b.udt_name::name = ANY (ARRAY['float4'::name, 'float8'::name, 'numeric'::name]) THEN b.numeric_scale::integer
                    ELSE NULL::integer
                END AS nu_escala,
                CASE
                    WHEN b.udt_name::name = ANY (ARRAY['varchar'::name, 'char'::name, 'bpchar'::name]) THEN ('('::text || b.character_maximum_length) || ')'::text
                    WHEN b.udt_name::name = ANY (ARRAY['float4'::name, 'float8'::name, 'numeric'::name]) THEN ((('('::text || b.numeric_precision) || ','::text) || b.numeric_scale) || ')'::text
                    ELSE ''::text
                END AS gn_tamanho_maximo,
            COALESCE((( SELECT a2.ordinal_position
                   FROM information_schema.table_constraints a1
                     JOIN information_schema.key_column_usage a2 ON a2.table_catalog::name = a1.table_catalog::name AND a2.table_schema::name = a1.table_schema::name AND a2.table_name::name = a1.table_name::name AND a2.constraint_name::name = a1.constraint_name::name
                  WHERE a1.constraint_type::text = 'PRIMARY KEY'::text AND a1.table_catalog::name = a.table_catalog::name AND a1.table_schema::name = a.table_schema::name AND a1.table_name::name = a.table_name::name AND a2.column_name::name = b.column_name::name))::integer, 0) AS cd_pk_ordem,
            COALESCE((( SELECT a2.ordinal_position
                   FROM information_schema.table_constraints a1
                     JOIN information_schema.key_column_usage a2 ON a2.table_catalog::name = a1.table_catalog::name AND a2.table_schema::name = a1.table_schema::name AND a2.table_name::name = a1.table_name::name AND a2.constraint_name::name = a1.constraint_name::name
                  WHERE a1.constraint_type::text = 'UNIQUE'::text AND a1.table_catalog::name = a.table_catalog::name AND a1.table_schema::name = a.table_schema::name AND a1.table_name::name = a.table_name::name AND a2.column_name::name = b.column_name::name))::integer, 0) AS cd_unique_ordem,
            b.is_nullable,
            COALESCE("left"(b.column_default::character varying::text, 7) = 'nextval'::text, false) AS is_identity,
            b.udt_name::name = ANY (ARRAY['int2'::name, 'int4'::name, 'int8'::name, 'float4'::name, 'float8'::name]) AS is_numeric,
            b.udt_name::name = ANY (ARRAY['varchar'::name, 'char'::name, 'bpchar'::name]) AS is_text,
            b.udt_name::name = ANY (ARRAY['timestamp'::name, 'timestamptz'::name, 'interval'::name]) AS is_date,
            b.udt_name::name = 'bytea'::name AS is_image,
            b.udt_name::name = ANY (ARRAY['float4'::name, 'float8'::name]) AS is_currency,
                CASE
                    WHEN b.udt_name::name = ANY (ARRAY['bool'::name, 'int2'::name, 'int4'::name, 'int8'::name, 'float4'::name, 'float8'::name]) THEN ''::text
                    ELSE ''''::text
                END AS ic_where,
                CASE
                    WHEN b.udt_name::name = ANY (ARRAY['timestamp'::name, 'timestamptz'::name, 'interval'::name]) THEN '19000101'::text
                    WHEN b.udt_name::name = ANY (ARRAY['int2'::name, 'int4'::name, 'int8'::name, 'float4'::name, 'float8'::name]) THEN '0'::text
                    WHEN b.udt_name::name = ANY (ARRAY['varchar'::name, 'char'::name, 'bpchar'::name]) THEN ''::text
                    WHEN b.udt_name::name = 'bool'::name THEN 'false'::text
                    ELSE NULL::text
                END AS ds_default,
                CASE
                    WHEN b.udt_name::name = ANY (ARRAY['timestamp'::name, 'timestamptz'::name, 'interval'::name]) THEN ' = ''19000101'''::text
                    WHEN b.udt_name::name = ANY (ARRAY['int2'::name, 'int4'::name, 'int8'::name, 'float4'::name, 'float8'::name]) THEN ' = 0'::text
                    WHEN b.udt_name::name = ANY (ARRAY['varchar'::name, 'char'::name, 'bpchar'::name]) THEN ' = '''''::text
                    WHEN b.udt_name::name = 'bool'::name THEN ' = false'::text
                    ELSE NULL::text
                END AS gn_default
           FROM information_schema.tables a
             JOIN information_schema.columns b ON b.table_catalog::name = a.table_catalog::name AND b.table_schema::name = a.table_schema::name AND b.table_name::name = a.table_name::name
          WHERE a.table_schema::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name])) z;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tbl_instancia_id_instancia_seq"
OWNED BY "public"."tbl_instancia"."id_instancia";
SELECT setval('"public"."tbl_instancia_id_instancia_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."tbl_mensagem_telegram_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."tbl_mensagem_whatsapp_id_seq"', 79, true);

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
-- Uniques structure for table tbl_chat
-- ----------------------------
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "uq_chat_unica" UNIQUE ("id_utilizador", "cd_provider", "id_instancia");

-- ----------------------------
-- Primary Key structure for table tbl_chat
-- ----------------------------
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "tbl_chat_pkey" PRIMARY KEY ("id_chat");

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
-- Primary Key structure for table tbl_funil_utilizador
-- ----------------------------
ALTER TABLE "public"."tbl_funil_utilizador" ADD CONSTRAINT "tbl_funil_utilizador_pkey" PRIMARY KEY ("id_funil_utilizador");

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
-- Uniques structure for table tbl_status
-- ----------------------------
ALTER TABLE "public"."tbl_status" ADD CONSTRAINT "tbl_status_ds_status_key" UNIQUE ("ds_status");

-- ----------------------------
-- Primary Key structure for table tbl_status
-- ----------------------------
ALTER TABLE "public"."tbl_status" ADD CONSTRAINT "tbl_status_pkey" PRIMARY KEY ("cd_status");

-- ----------------------------
-- Primary Key structure for table tbl_utilizador
-- ----------------------------
ALTER TABLE "public"."tbl_utilizador" ADD CONSTRAINT "tbl_utilizador_pkey" PRIMARY KEY ("id_utilizador");

-- ----------------------------
-- Foreign Keys structure for table tbl_chat
-- ----------------------------
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "fk_chat_instancia" FOREIGN KEY ("id_instancia") REFERENCES "public"."tbl_instancia" ("id_instancia") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "fk_chat_provider" FOREIGN KEY ("cd_provider") REFERENCES "public"."tbl_provider" ("cd_provider") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_chat" ADD CONSTRAINT "fk_chat_utilizador" FOREIGN KEY ("id_utilizador") REFERENCES "public"."tbl_utilizador" ("id_utilizador") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_cadastro
-- ----------------------------
ALTER TABLE "public"."tbl_funil_cadastro" ADD CONSTRAINT "fk_tbl_funil_cadastro_tbl_funil_1" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_cadastro_botao
-- ----------------------------
ALTER TABLE "public"."tbl_funil_cadastro_botao" ADD CONSTRAINT "fk_tbl_funil_cadastro_botao_tbl_funil_cadastro_1" FOREIGN KEY ("id_funil_cadastro") REFERENCES "public"."tbl_funil_cadastro" ("id_funil_cadastro") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_chatbot
-- ----------------------------
ALTER TABLE "public"."tbl_funil_chatbot" ADD CONSTRAINT "fk_tbl_funil_chatbot_tbl_funil_1" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_chatbot_botao
-- ----------------------------
ALTER TABLE "public"."tbl_funil_chatbot_botao" ADD CONSTRAINT "fk_tbl_funil_chatbot_botao_tbl_funil_chatbot_1" FOREIGN KEY ("id_funil_chatbot") REFERENCES "public"."tbl_funil_chatbot" ("id_funil_chatbot") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_funil_utilizador
-- ----------------------------
ALTER TABLE "public"."tbl_funil_utilizador" ADD CONSTRAINT "fk_tbl_funil_utilizador_tbl_funil_1" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_funil_utilizador" ADD CONSTRAINT "fk_tbl_funil_utilizador_tbl_utilizador_2" FOREIGN KEY ("id_utilizador") REFERENCES "public"."tbl_utilizador" ("id_utilizador") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tbl_instancia
-- ----------------------------
ALTER TABLE "public"."tbl_instancia" ADD CONSTRAINT "fk_instancia_funil" FOREIGN KEY ("id_funil") REFERENCES "public"."tbl_funil" ("id_funil") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_instancia" ADD CONSTRAINT "fk_instancia_provider" FOREIGN KEY ("cd_provider") REFERENCES "public"."tbl_provider" ("cd_provider") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."tbl_instancia" ADD CONSTRAINT "fk_instancia_status" FOREIGN KEY ("cd_status") REFERENCES "public"."tbl_status" ("cd_status") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table tbl_mensagem
-- ----------------------------
ALTER TABLE "public"."tbl_mensagem" ADD CONSTRAINT "fk_mensagem_chat" FOREIGN KEY ("id_chat") REFERENCES "public"."tbl_chat" ("id_chat") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."tbl_mensagem" ADD CONSTRAINT "fk_mensagem_provider" FOREIGN KEY ("cd_provider") REFERENCES "public"."tbl_provider" ("cd_provider") ON DELETE NO ACTION ON UPDATE NO ACTION;
