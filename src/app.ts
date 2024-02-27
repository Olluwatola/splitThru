import morgan from 'morgan';
import express from 'express';
import logger from './logger';
import authRouter from './authentication/routes';
import errorController from './errorController';
import expenseRouter from './expense/routes';
import currencyRouter from './currency/routes';
import userRouter from './users/routes';

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
app.use(express.urlencoded({extended: true}));

//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/expense', expenseRouter);
app.use('/api/v1/currency', currencyRouter);
app.use('/api/v1/users', userRouter);

app.use(errorController);

app.use(morganMiddleware);

export default app;
