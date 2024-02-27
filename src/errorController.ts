import {Request, Response, NextFunction} from 'express';
import AppError from './utils/appError';
import {NODE_ENV} from './config/envConfig';

interface IAppError extends Error {
  statusCode: number;
  status: string;
  code?: string;
}

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleDuplicateEmailError = () =>
  new AppError('an account with the email inputted exists already', 422);

const handleAlreadyBlockedUserError = () =>
  new AppError('you have blocked that user already', 409);

const sendErrorDev = (error: IAppError, req: Request, res: Response) => {
  return res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
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

  if (NODE_ENV === 'development') {
    let error: IAppError = {...err};
    error.message = err.message;
    if (
      error.message ===
      'duplicate key value violates unique constraint "users_email_key"'
    )
      error = handleDuplicateEmailError();

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.code === '23505') error = handleAlreadyBlockedUserError();
    sendErrorDev(error, req, res);
  } else if (NODE_ENV === 'production') {
    // let error = {...err};
    // error.message = err.message;
    // if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    // sendErrorProd(error, req, res);
  }
};
