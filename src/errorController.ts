import {Request, Response, NextFunction} from 'express';
import AppError from './utils/appError';

interface IAppError extends Error {
  statusCode: number;
  status: string;
}

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: IAppError, req: Request, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
export default (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    let error: IAppError = {...err};
    error.message = err.message;
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = {...err};
    // error.message = err.message;
    // if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    // sendErrorProd(error, req, res);
  }
};
