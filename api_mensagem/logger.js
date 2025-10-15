const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level}]: ${message}`)
      )
    }),
    new transports.File({ filename: "logs/app.log" }),
    new transports.File({ filename: "logs/error.log", level: "error" })
  ]
});

module.exports = logger;
