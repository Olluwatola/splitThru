import {Request, Response, NextFunction} from 'express';
import pool from './../db/db';
import AppError from '../utils/appError';
// apply catch async

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const {
    email,
    password,
    confirmPassword,
    last_name,
    first_name,
    date_of_birth,
  } = req.body;

  //check if password==confirmPassword
  if (password !== confirmPassword) {
    return next(
      new AppError(
        'ensure that password and confirm password fields are the same',
        400
      )
    );
  }
  //check if no email like that in db
  //hash password
  //add row to db
  pool.query(
    `INSERT INTO users (email, password, last_name, first_name, date_of_birth, role, is_flagged, is_deleted, is_suspended, created_at) VALUES (${email}, ${password}, ${last_name}, ${first_name}, ${date_of_birth}, 'user', false, false, false, date.now())`,
    (error: Error, results) => {
      if (error) {
        return next(error);
      }
      res.status(201).json({
        status: 'success',
        message: 'account successfully created',
        user: results.rows,
      });
    }
  );
  //send account created email
  //send cookie
};

export default {signup};
