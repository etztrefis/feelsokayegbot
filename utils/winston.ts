import { createLogger, format, transports, addColors } from "winston";
import * as pc from "picocolors";

const { combine, colorize, timestamp, printf } = format;

const loggerLevels = {
  colors: {
    info: "green",
    error: "underline bold red",
    debug: "bold magenta",
    warn: "yellow",
  },
};

const logFormat = printf(({ level, message, timestamp }) => {
  return `${pc.magenta(timestamp)} | [${level}]: ${message}`;
});

const logger = createLogger({
  format: combine(
    format((info) => {
      info.level = info.level.toUpperCase();
      return info;
    })(),
    timestamp({
      format: "DD.MM.YY HH:mm:ss",
    }),
    colorize(),
    logFormat
  ),
  transports: [
    new transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

addColors(loggerLevels.colors);

logger.transports[0].level = "info";
logger.info(`${pc.green("[LOGGER]")} Setting log level to ${logger.transports[0].level}`);

const info = (message: string) => {
  logger.info(message);
};
const error = (message: string) => {
  logger.error(message);
};
const warn = (message: string) => {
  logger.warn(message);
};
const debug = (message: string) => {
  logger.debug(message);
};

export { info, error, warn, debug };
