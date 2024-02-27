import {Request, Response, NextFunction} from 'express';
import pool from './../db/db';
import AppError from '../utils/appError';
import catchAsync from './../utils/catchAsync';
import authServices from './services';
import {JWT_EXPIRES_IN} from '../config/envConfig';
import bcrypt from 'bcryptjs';
import generateRandomInteger from '../utils/intGenerator';
import addMinutesToTimestamp from '../utils/addMinutesToTimestamp';

//implement email verification before account creation

interface IRow {
  id: number;
}

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
    const client = await pool.connect();

    const query =
      'INSERT INTO users (email, password, last_name, first_name, date_of_birth, role, is_flagged, is_deleted, is_suspended, created_at) VALUES ($1, $2, $3, $4, $5, $6, false, false, false, NOW()) RETURNING id, email, last_name, first_name, date_of_birth;';
    const values = [
      email.toLowerCase().trim(),
      await authServices.hashPassword(password.trim()),
      last_name.trim(),
      first_name.trim(),
      date_of_birth.trim(),
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
    //const startTime = performance.now(); // Start the timer
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    if (!userEmail || !userPassword) {
      return next(new AppError('please provide email and password', 400));
    }
    const query =
      'SELECT id, email, password, last_name, first_name, date_of_birth, role, is_flagged, is_deleted, is_suspended FROM users WHERE email = $1';
    const values = [userEmail.toLowerCase()];

    const client = await pool.connect();

    client.query(query, values, async (error: Error, results) => {
      if (error) {
        return next(error);
      }
      // check if email exists
      if (results.rows.length === 0) {
        return next(new AppError('wrong email or password', 401));
      }
      //check if password matches
      if (
        (await bcrypt.compare(userPassword, results.rows[0].password)) === false
      ) {
        return next(new AppError('wrong email or password', 401));
      } else {
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

        //create 2fa token and send
        const loginConfirmationToken: string =
          generateRandomInteger().toString();

        const hashedLoginConfirmationToken = await authServices.hashPassword(
          loginConfirmationToken
        );
        console.log(Date.now());
        console.log(addMinutesToTimestamp(Date.now(), 30));
        console.log('-----------------');
        const updateUserTokenQuery =
          'UPDATE users SET login_confirmation_token = $1, login_confirmation_token_exp = $2 WHERE id = $3';
        const updateUserValues = [
          hashedLoginConfirmationToken,
          addMinutesToTimestamp(Date.now(), 30),
          results.rows[0].id,
        ];

        console.log(
          loginConfirmationToken,
          hashedLoginConfirmationToken,
          addMinutesToTimestamp(Date.now(), 30)
        );

        // Log the timer at the end of the controller
        // const endTime = performance.now();
        // console.log(
        //   `Controller execution time: ${endTime - startTime} milliseconds`
        // );

        //implement mailing bros

        client.query(
          updateUserTokenQuery,
          updateUserValues,
          async (error: Error) => {
            if (error) {
              next(error);
            }
            res.status(200).json({
              message: 'token has been sent to email',
            });
          }
        );
      }
    });
  }
);

const confirmLoginToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {email, token} = req.body;

    // read input
    //     // fetch email
    //     // compare code submitted to code inputted
    //     // check the expiration
    //send cookie
    //set token and exp to null

    if (token.trim().length !== 5) {
      return next(
        new AppError('Ensure token submitted is a 5 characters long', 400)
      );
    }

    if (email.trim().length < 1) {
      return next(new AppError('Ensure email is valid', 400));
    }

    const query =
      'SELECT id, email, login_confirmation_token, login_confirmation_token_exp FROM users WHERE email = $1';
    const values = [email.toLowerCase()];

    const client = await pool.connect();

    const {rows} = await client.query(query, values);

    if (rows.length === 0) {
      return next(new AppError('User not found', 404));
    }
    const user = rows[0];
    if (!user?.login_confirmation_token) {
      return next(new AppError('Invalid token, request new token', 401));
    }
    if (
      (await bcrypt.compare(token, user?.login_confirmation_token)) === false
    ) {
      return next(new AppError('Wrong token', 401));
    } else {
      console.log(user?.login_confirmation_token_exp);
      const expInUTC = new Date(user?.login_confirmation_token_exp).getTime();
      if ((expInUTC - new Date().getTime()) / (60 * 1000) < 0) {
        console.log('token expired');
        //set the token and its expiration in db to null
        const queryToNullToken =
          'UPDATE users SET login_confirmation_token = null, login_confirmation_token_exp = null WHERE id = $1';
        await client.query(queryToNullToken, [user?.id]);
        return next(new AppError('Invalid token, request new token', 401));
      } else {
        console.log((expInUTC - new Date().getTime()) / (60 * 1000));
        console.log('token not expired');
        //send jwt and set the token and its expiration in db to null
        const jwtToken = authServices.createJWT(user?.id);

        const queryToNullToken =
          'UPDATE users SET login_confirmation_token = null, login_confirmation_token_exp = null WHERE id = $1';
        await client.query(queryToNullToken, [user?.id]);

        client.release();
        res
          .status(201)
          .cookie('jwt_token', jwtToken, {
            expires: new Date(Date.now() + parseInt(JWT_EXPIRES_IN as string)),
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
          })
          .json({
            status: 'success',
            message: 'account successfully logged in',
          });
      }
    }
  }
);

// const loginTokenConfirm = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // read input
//     // fetch email
//     // compare code submitted to code inputted
//     // check the expiration

//     const {email, token} = req.body;

//     if (token.trim().length !== 5) {
//       return next(
//         new AppError('Ensure token submitted is a 5 characters long', 400)
//       );
//     }

//     if (email.trim().length < 1) {
//       return next(new AppError('Ensure email is valid', 400));
//     }

//     const query =
//       'SELECT id, email, login_confirmation_token, login_confirmation_token_exp FROM users WHERE email = $1';
//     const values = [email.toLowerCase()];

//     const client = await pool.connect();

//     const {rows} = await client.query(query, values);

//     if (rows.length === 0) {
//       return next(new AppError('User not found', 404));
//     }

//     const user = rows[0];

//     // Uncomment the following block if you want to compare the token using bcrypt
//     /*
//       if (!(await bcrypt.compare(token, user.login_confirmation_token))) {
//         return next(new AppError('Wrong login token', 401));
//       }
//       */

//     const tokenExpirationDate = new Date(user.login_confirmation_token_exp);
//     const targetTimezone = 'UTC'; // Change this to your desired timezone, e.g., 'America/New_York'
//     const currentDate = new Date();

//     // Use Intl.DateTimeFormat to format the date and time in the target timezone
//     const formattedDate = new Intl.DateTimeFormat('en-GB', {
//       timeZone: targetTimezone,
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     }).format(currentDate);

//     // Get milliseconds and pad with zeros if necessary
//     const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');

//     // Concatenate milliseconds to the formatted date
//     const formattedDateWithMilliseconds = `${formattedDate}.${milliseconds}Z`;

//     console.log(tokenExpirationDate);
//     console.log(formattedDateWithMilliseconds);

//     // if (nowInTokenTimeZone > tokenExpirationDate) {
//     //   return next(new AppError('Token has expired', 401));
//     // }

//     // Your additional logic goes here if the token is valid

//     // For debugging purposes, log the calibrated 'now'
//     // console.log('Calibrated now:', nowInTokenTimeZone);

//     // Release the client back to the pool
//     client.release();

//     // Continue with the next middleware or route handler
//   }
// );

export default {signup, login, confirmLoginToken};
