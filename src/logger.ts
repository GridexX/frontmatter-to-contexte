import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:dd-mm-yy HH:MM:ss",
      ignore: "pid,hostname",
    },
  },
  base: {
    env: process.env.NODE_ENV,
  },
});

export default logger;
