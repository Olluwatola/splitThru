import {Interface} from 'readline/promises';

const {createLogger, transports, format} = require('winston');

interface info {
  timestamp: string;
  level: string;
  message: string;
}

const customFormat = format.combine(
  format.errors({stack: true}),
  format.timestamp(),
  format.printf((info: info) => {
    return `${info.timestamp} [${info.level.toUpperCase().padEnd(7)}]: ${
      info.message
    }`;
  })
);

const logger = createLogger({
  format: customFormat,
  transports: [
    new transports.Console({level: 'silly'}),
    new transports.File({filename: 'app.log', level: 'info'}),
  ],
});

export default logger;
