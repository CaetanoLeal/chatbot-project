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

pool.query(`SELECT id_funil FROM tbl_funil LIMIT 1`, (err, res) => {
  if (err) {
    logger.error(`❌ Erro ao buscar id_funil: ${err.message}`, { stack: err.stack });
  } else {
    if (res.rows.length > 0) {
      global.gIdFunil = res.rows[0].id_funil;
      logger.info(`✅ id_funil carregado: ${global.gIdFunil}`);
    } else {
      global.gIdFunil = '' + require('uuid').v4();
      pool.query(`INSERT INTO tbl_funil (id_funil, no_funil) VALUES (uuid_generate_v4(), $1)`, [global.gIdFunil, 'FUNIL PADRÃO'], (err2) => {
        if (err2) {
          logger.error(`❌ Erro ao inserir na tbl_funil: ${err2.message}`, { stack: err2.stack });
        } else {
          logger.info(`✅ Inserção na tbl_funil  realizada com sucesso.`);
        } 
      },); 
    }
  }
},);

global.gExpirarMinutos = 10;
logger.info(`⏳ Mensagem expiradas definido para ${global.gExpirarMinutos} minutos de inatividade.`);

module.exports = pool;
