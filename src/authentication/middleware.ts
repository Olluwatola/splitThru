import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import authServices from './services';
import type authInterfaces from './interfaces';
import {Request, Response, NextFunction} from 'express';

// interface IRequestUser extends Request {
//   headers: {authorization: string};
// }

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const reqHeadersAuthorization: string = req.headers.authorization;

      const getUserResult:
        | boolean
        | authInterfaces.AuthResult
        | Error
        | null
        | undefined = await authServices.getUserFromBearerToken(
        reqHeadersAuthorization,
        next
      );
      console.log('this is me');
      console.log(getUserResult);
      if (getUserResult === false) {
        console.log('hmmm token exp');

        return next(new AppError('login token expired , kindly relogin', 401));
      } else {
        req.currentUser = getUserResult as authInterfaces.AuthResult;
        next();
      }
    } else {
      return next(new AppError('unauthorized, kindly login', 401));
    }
  }
);

export default {protect};
