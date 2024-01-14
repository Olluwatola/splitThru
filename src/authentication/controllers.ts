import {Request, Response, NextFunction} from 'express';
import pool from './../db/db';
import AppError from '../utils/appError';
import catchAsync from './../utils/catchAsync';
import authServices from './services';
import {JWT_EXPIRES_IN} from '../config/envConfig';
import bcrypt from 'bcryptjs';

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
      email.toLowerCase(),
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

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    const {email, password} = req.body;
    const query =
      'SELECT id, email, password, last_name, first_name, date_of_birth, role, is_flagged, is_deleted, is_suspended FROM users WHERE email = $1';
    const values = [email.toLowerCase()];

    client.query(query, values, async (error: Error, results) => {
      if (!email || !password) {
        return next(new AppError('please provide email and password', 400));
      }
      if (error) {
        return next(error);
      }
      // check if email exists
      if (results.rows.length === 0) {
        return next(new AppError('wrong email or password', 401));
      }
      //check if password matches
      if (
        (await bcrypt.compare(results.rows[0].password, password)) === false
      ) {
        console.log(await bcrypt.compare(results.rows[0].password, password));
        return next(new AppError('wrong email or password', 401));
      }
      //check if account has not been deleted
      if (results.rows[0].is_deleted) {
        return next(
          new AppError(
            'Your account has been deleted. Please contact support for further assistance.',
            403
          )
        );
      }
      //check if account has not been banned
      if (results.rows[0].is_suspended) {
        return next(
          new AppError(
            'Your account is currently suspended. Please contact support for further assistance.',
            403
          )
        );
      }
      //send jwt
      if ((await bcrypt.compare(results.rows[0].password, password)) === true) {
        console.log(await bcrypt.compare(results.rows[0].password, password));
        return next(new AppError('wrong email or password', 401));
      }
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
          message: 'account successfully logged in',
          user: results.rows[0],
        });
    });
  }
);
export default {signup, login};
