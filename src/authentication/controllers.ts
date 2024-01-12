import {Request, Response, NextFunction} from 'express';
import pool from './../db/db';
import AppError from '../utils/appError';
import catchAsync from './../utils/catchAsync';
import authServices from './services';
import {JWT_EXPIRES_IN} from '../config/envConfig';

//implement email verification before account creation

interface IRow {
  id: number;
}

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    const {
      email,
      password,
      confirmPassword,
      last_name,
      first_name,
      date_of_birth,
    } = req.body;

    //check if password==confirmPassword ---d
    if (password !== confirmPassword) {
      return next(
        new AppError(
          'ensure that password and confirm password fields are the same',
          400
        )
      );
    }
    //check if no email like that in db --- d
    //hash password ---d
    //add row to db---- d

    const query =
      'INSERT INTO users (email, password, last_name, first_name, date_of_birth, role, is_flagged, is_deleted, is_suspended, created_at) VALUES ($1, $2, $3, $4, $5, $6, false, false, false, NOW()) RETURNING id, email, last_name, first_name, date_of_birth;';
    const values = [
      email,
      await authServices.hashPassword(password),
      last_name,
      first_name,
      date_of_birth,
      'user',
    ];

    client.query(query, values, (error: Error, results) => {
      if (error) {
        return next(error);
      }

      //sendcookie----d
      const token = authServices.createJWT((results.rows[0] as IRow).id);

      res
        .status(201)
        .cookie('jwt', token, {
          expires: new Date(Date.now() + parseInt(JWT_EXPIRES_IN as string)),
          httpOnly: true,
          secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        })
        .json({
          status: 'success',
          message: 'account successfully created',
          user: results.rows,
        });
    });
    //send account created email
  }
);
export default {signup};
