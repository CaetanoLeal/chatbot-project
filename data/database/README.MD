# Database – Chatbot

Este diretório contém o schema do banco de dados utilizado pela aplicação **Chatbot**.

## 📄 Arquivos

### public.sql

Responsável por criar toda a estrutura do schema `public`, incluindo:

- Tabelas
- Funções
- Views
- Índices
- Extensões necessárias

⚠️ O arquivo **contém dados defaults usados apenas pra exemplo!** Junto a sua estrutura.

---

## 🐘 Banco de Dados

- SGBD: PostgreSQL
- Versão recomendada: 15+
- Schema: public

### Extensões utilizadas

As extensões utilizadas são criadas nas funções dentro da pasta "dependencies" sendo que as query presentes nessa pasta devem ser rodadas antes de qualquer ação no banco seguindo a ordem:

1. db_configuracao.sql
2. fn_ret_numerico.sql
3. fn_ret_numero_emb.sql
4. fn_ret_space.sql
5. fn_ret_upper.sql
6. fn_ret_zero.sql
7. vw_sys_table.sql
8. fn_copy.sql
9. fn_ret_ds_campos.sql
10. fn_ret_file_extrair.sql
11. fn_ret_lower.sql
12. fn_ret_moeda.sql
13. fn_ret_normal.sql
14. fn_adm_menu.sql
15. copy_insert.sql
16. db_default.sql
17. fn_add_menu.sql
18. fn_auditoria_insert.sql
19. db_auditoria.sql

---

## 🧠 Arquitetura do Banco de Dados

O banco foi modelado para suportar **conversas automatizadas em formato de funil**, permitindo fluxos dinâmicos tanto para **cadastro inicial** quanto para **navegação contínua do chatbot**.

A arquitetura é composta por **quatro núcleos principais**:

1. Funil
2. Utilizadores
3. Conversação (Cadastro e Chatbot)
4. Registro de Chat (Histórico)

---

## 🔁 Estrutura de Funil

### tbl_funil

Tabela raiz do sistema de conversação.

- Define um funil de atendimento (ex: atendimento comercial, suporte, onboarding).
- Um funil pode ser reutilizado por vários utilizadores.

Campos principais:

- `id_funil`
- `no_funil`

---

## 👤 Utilizadores

### tbl_utilizador

Armazena os dados únicos de cada utilizador da plataforma.

- Um utilizador pode conversar via WhatsApp, Telegram ou ambos.
- A identificação é feita pelos campos `cd_whatsapp` ou `cd_telegram`.

Campos principais:

- `id_utilizador`
- `nu_utilizador`
- `nu_telefone`
- `cd_whatsapp`
- `cd_telegram`

---

### tbl_funil_utilizador

Responsável por **ligar um utilizador a um funil específico** e controlar o estado da conversa.

É aqui que o sistema sabe:

- Em qual mensagem o utilizador está
- Se o funil expirou
- Se está em fase de cadastro ou chatbot

Campos importantes:

- `id_funil`
- `id_utilizador`
- `cd_mensagem_cadastro`
- `cd_mensagem_chatbot`
- `dh_mensagem`
- `dh_expiracao`

👉 Esta tabela é o **estado da conversa**.

---

## 📝 Cadastro Inicial (Onboarding)

### tbl_funil_cadastro

Define as mensagens iniciais do funil, normalmente usadas para:

- Boas-vindas
- Coleta de intenção
- Primeira decisão do utilizador

Campos principais:

- `cd_mensagem`
- `ds_mensagem`
- `is_aguardar`

---

### tbl_funil_cadastro_botao

Define os botões/opções disponíveis para cada mensagem de cadastro.

- Cada botão aponta para um `cd_mensagem_destino`
- O destino pode ser outra mensagem ou o início do chatbot

Campos principais:

- `cd_botao`
- `ds_botao`
- `cd_mensagem_destino`

---

## 🤖 Conversação do Chatbot

### tbl_funil_chatbot

Representa as mensagens do chatbot após o cadastro inicial.

- Cada mensagem pode conter texto e opções
- O fluxo é totalmente controlado por dados

Campos principais:

- `cd_mensagem`
- `ds_mensagem`
- `is_aguardar`

---

### tbl_funil_chatbot_botao

Define os botões de cada mensagem do chatbot.

- Cada botão leva a uma nova mensagem (`cd_mensagem_destino`)
- Permite criar árvores complexas de decisão

Campos principais:

- `cd_botao`
- `ds_botao`
- `cd_mensagem_destino`

---

## 💬 Histórico de Conversas

### tbl_chat

Tabela responsável por registrar **todas as mensagens trocadas**.

- Guarda mensagens do utilizador e do chatbot
- Indica se a mensagem faz parte do cadastro ou do chatbot
- Mantém histórico auditável da conversa

Campos principais:

- `id_chat`
- `id_funil_utilizador`
- `sg_status`
- `dh_mensagem`
- `is_cadastro`
- `is_chatbot`

---

### tbl_chat_status

Tabela de domínio para status da conversa.

Exemplos:

- Aguardando resposta
- Finalizado
- Expirado

Campos:

- `sg_chat_status`
- `ds_chat_status`

---

## 🔄 Fluxo Resumido da Conversa

1. Utilizador envia mensagem (WhatsApp ou Telegram)
2. Sistema identifica ou cria o utilizador
3. Verifica se já existe funil ativo
4. Se não existir → inicia cadastro
5. Se existir → continua o chatbot
6. Botões determinam o próximo estado
7. Estado é salvo em `tbl_funil_utilizador`
8. Mensagens são registradas em `tbl_chat`

---

## ✅ Benefícios da Arquitetura

- Totalmente orientada a dados
- Permite alterar fluxos sem mudar código
- Suporta múltiplos canais
- Escalável para múltiplos funis
- Histórico completo de conversas

---
