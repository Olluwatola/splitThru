import {NextFunction} from 'express';
import AppError from './appError';
AppError;

function sumNumericProperties(
  obj: {[key: string]: number},
  next: NextFunction
): number | string | void {
  let sum = 0;

  for (const key in obj) {
    if (typeof obj[key] === 'number') {
      sum += obj[key];
    } else {
      return next(new AppError(`Property '${key}' is not a number`, 400));
    }
  }

  return sum;
}

export default sumNumericProperties;
