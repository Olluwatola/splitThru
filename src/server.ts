import express from 'express';
import logger from './logger';
import dotenv from 'dotenv';
import morgan from 'morgan';

const app = express();
dotenv.config();

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message: string) => logger.http(message.trim()),
    },
  }
);

app.use(morganMiddleware);

