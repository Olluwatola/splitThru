import bcrypt from 'bcryptjs';
import pool from './../db/db';
import jwt, {JwtPayload} from 'jsonwebtoken';
import {JWT_SECRET, JWT_EXPIRES_IN} from './../config/envConfig';
import {NextFunction} from 'express';
import {AuthResult} from './interfaces';
import AppError from '../utils/appError';

interface QueryResult {
  // Define your user model interface
  userID: String;
}

const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  return hashedPassword;
};

const createJWT = (id: number) => {
  //signtoken

  return jwt.sign({id, exp: Number(JWT_EXPIRES_IN)}, JWT_SECRET as string);
};

const getUserFromBearerToken = async (
  reqHeadersAuthorization: string,
  next: NextFunction
): Promise<AuthResult | void | null | Error | undefined | boolean> => {
  const authHeader = reqHeadersAuthorization;
  const secretKey: string = process.env.JWT_SECRET as string;

  let jwtDecodedToken: JwtPayload | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      jwtDecodedToken = jwt.verify(token, secretKey) as JwtPayload;

      const userID: string = jwtDecodedToken?.id;

      const query = 'SELECT * FROM users WHERE id = $1';
      const client = await pool.connect();

      try {
        const {rows} = await client.query(query, [userID]);
        client.release();
        if (rows[0].is_suspended === true) {
          return next(new AppError('your account is suspended', 401));
        }
        if (rows[0].is_deleted === true) {
          return next(new AppError('error, not authorized', 401));
        }
        if (rows && rows.length > 0) {
          return rows[0]; // Assuming you return the first user found
        } else {
          return null; // User not found
        }
      } catch (error) {
        client.release();
        throw error;
      }
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        return false;
      } else {
        next(err);
      }
    }
  } else {
    console.log('There is no bearer');
  }

  return null; // Return null if no valid token or user found
};

export default {hashPassword, getUserFromBearerToken, createJWT};
