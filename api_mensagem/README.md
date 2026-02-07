# 📩 api_mensagem

API responsável por **orquestrar mensagens e conversas de chatbot** via **WhatsApp** e **Telegram**, utilizando uma **lógica de funil conversacional** baseada em banco de dados.

Este serviço atua como o **cérebro do fluxo**, decidindo:

- quando enviar a mensagem inicial
- quando validar respostas
- qual a próxima mensagem do funil
- quando encerrar ou avançar o atendimento

---

## 🚀 Principais responsabilidades

- Receber **webhooks** do WhatsApp (Baileys) e Telegram
- Identificar o usuário (criar se não existir)
- Controlar o **estado da conversa** por funil
- Validar respostas numéricas (botões)
- Enviar mensagens para:
  - API de WhatsApp (`chatbot-erp`)
  - API de Telegram (`telegram-bot`)
- Persistir mensagens e estados no PostgreSQL

---

## 🧠 Conceito de Funil Conversacional

O fluxo de conversa é **100% controlado pelo banco de dados**, usando as tabelas:

### Cadastro (primeira interação)

- `tbl_funil_cadastro`
- `tbl_funil_cadastro_botao`

### Chatbot (fluxo contínuo)

- `tbl_funil_chatbot`
- `tbl_funil_chatbot_botao`

### Controle do usuário

- `tbl_utilizador`
- `tbl_funil_utilizador`

Cada resposta do usuário **precisa ser um número** correspondente a um botão válido.  
Qualquer texto inválido gera automaticamente:

```

resposta invalida! escolha uma das opções acima digitando o numero correspondente a ela

```

---

## 📂 Estrutura do projeto

```

api_mensagem/
├── src/
│   ├── helpers/
│   │   └── helpers.js          # Lógica central do funil e conversação
│   ├── services/
│   │   └── sendMessage.js      # Envio de mensagens (WhatsApp / Telegram)
│   ├── models/
│   │   ├── MessageModel.js
│   │   └── TelegramMessageModel.js
│   ├── constants/
│   │   └── chatbot.constants.js
│   ├── config/
│   │   └── db.js               # Conexão PostgreSQL
│   └── server.js               # Webhook principal
├── logger/
├── .env
├── package.json
└── README.md

```

---

## 🔌 Integrações externas

### WhatsApp

Envia mensagens para:

```

POST [http://chatbot-erp:3000/instances/caetano_bot/message](http://chatbot-erp:3000/instances/caetano_bot/message)

```

Payload:

```json
{
  "number": "559999999999",
  "message": "Mensagem aqui"
}
```

---

### Telegram

Envia mensagens para:

```
POST http://telegram-bot:3002/send-message
```

Payload:

```json
{
  "nome": "Bot",
  "userId": "123456789",
  "message": "Mensagem aqui"
}
```

---

## 🧩 Webhook

### Endpoint

```
POST /webhook
```

Este endpoint:

- Detecta automaticamente se a mensagem vem do **Telegram** ou **WhatsApp**
- Salva a mensagem no banco
- Cria ou recupera o usuário
- Decide se o usuário:
  - está no cadastro
  - está no fluxo do chatbot

- Envia a próxima mensagem adequada

---

## 🧪 Regras importantes de negócio

- Apenas **respostas numéricas** são aceitas
- O número precisa existir como `cd_botao`
- O funil **expira automaticamente** após um tempo configurado
- Mensagens enviadas pelo próprio bot são ignoradas
- Mensagens de sistema (ex: protocolMessage do WhatsApp) são descartadas

---

## ⚙️ Variáveis de ambiente (.env)

Exemplo básico:

```env
PORT=3001

DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=chatbot
```

---

## ▶️ Como rodar o projeto

### 1️⃣ Instalar dependências

```bash
npm install
```

### 2️⃣ Subir o serviço

```bash
npm start
```

ou em desenvolvimento:

```bash
npm run dev
```

---

## ✅ Health check

Acesse:

```
GET /
```

Resposta:

```
🚀 API de Mensagens ativa e rodando!
```

---

## 🧠 Observações finais

- Este projeto **não envia mensagens diretamente** para WhatsApp ou Telegram
- Ele funciona como um **orquestrador de regras e estado**
- Toda a lógica de conversa pode ser alterada **sem mexer no código**, apenas ajustando o banco

```

```
