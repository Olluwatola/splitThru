import morgan from 'morgan';
import express from 'express';
import logger from './logger';
import authRouter from './authentication/routes';
import errorController from './errorController';

const app = express();

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message: string) => logger.http(message.trim()),
    },
  }
);

app.use(express.json());
app.use(express.urlencoded());

//routes
app.use('/api/v1/auth', authRouter);
app.use(errorController);

app.use(morganMiddleware);

export default app;
