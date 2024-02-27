import {Request, Response, NextFunction} from 'express';
import pool from './../db/db';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

const getAllCurrency = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = 'SELECT * from currencies;';
    const client = await pool.connect();

    client.query(query, (error: Error, results) => {
      if (error) {
        next(error);
      }
      res.status(200).json({
        currency: results.rows,
      });
    });
  }
);

const createCurrency = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {name, code} = req.body;
    if (!name || !code) {
      return next(
        new AppError('ensure all fields are approriately filled', 400)
      );
    }
    if (code.trim().length >= 5) {
      return next(
        new AppError(
          'ensure the currency code is shorter than five characters',
          400
        )
      );
    }
    const client = await pool.connect();
    const query =
      'INSERT INTO currencies (name, currency_code) VALUES ($1, $2) RETURNING id, name, currency_code;';
    const values = [name.trim(), code.toUpperCase()];
    client.query(query, values, (error: Error, results) => {
      if (error) {
        next(error);
      }
      res.status(200).json({
        message: 'currency created',
        currency: results?.rows,
      });
    });
  }
);

export default {createCurrency, getAllCurrency};
