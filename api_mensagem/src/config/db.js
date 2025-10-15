const { Pool } = require("pg");
const logger = require("../../logger");

require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  port: Number(process.env.DB_PORT || 5432),
});

// Teste de conexão simplificado
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error(`❌ Erro de conexão com PostgreSQL: ${err.message}`, { stack: err.stack });
  } else {
    logger.info(`✅ Conectado ao PostgreSQL. Hora do servidor: ${res.rows[0].now}`);
  }
});

module.exports = pool;
