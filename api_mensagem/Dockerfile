# Dockerfile para Node.js
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia o restante do código
COPY . .

# Expõe a porta (ajuste se necessário)
EXPOSE 3000

# Comando para iniciar a aplicação

CMD ["node", "src/server.js"]
