# Dockerfile para Node.js
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala TODAS as dependências (não apenas produção)
RUN npm install
RUN npm install uuid@8
# Copia o restante do código
COPY . .

# Expõe a porta (ajuste se necessário)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
