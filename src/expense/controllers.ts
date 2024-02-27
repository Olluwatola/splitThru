import {Request, Response, NextFunction} from 'express';
import catchAsync from '../utils/catchAsync';
import userServices from './../users/services'
import AppError from '../utils/appError';
import {ICurrencyModel} from './../currency/interfaces';
import {QueryResult} from 'pg';
import {ulid} from 'ulid';
import pool from './../db/db';
import expenseServices from './services';

//const Iparticpant

// const createExpense = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const {costOfExpense, currency, description, participants} = req.body;

//     if (!costOfExpense || !currency || !description) {
//       return next(
//         new AppError('ensure all fields are approriately filled', 400)
//       );
//     }
//     //check if cost of expense is number
//     if (typeof costOfExpense !== 'number') {
//       return next(
//         new AppError('ensure the cost of expense inputted is a number', 400)
//       );
//     }
//     //ensure the sum of the participants cut is equal to the cost of expense
//     if (costOfExpense !== sumNumericProperties(participants, next)) {
//       return next(
//         new AppError(
//           'ensure the sum of the individual payments of participants equals the cost of expense',
//           400
//         )
//       );
//     }
//     //ensure that currency id exists in db
//     // const query = 'SELECT * FROM currencies WHERE id = $1';
//     // const values = [currency];
//     // const client = await pool.connect();
//     // let currencyReturned;
//     // client.query(
//     //   query,
//     //   values,
//     //   (error: Error, results: QueryResult<ICurrencyModel>) => {
//     //     if (error) {
//     //       next(error);
//     //     }
//     //     if (results.length === 0) {
//     //       next(new AppError('currency does not exist in database', 404));
//     //     }
//     //     currencyReturned = results.rows[0];
//     //   }
//     // );

//     const client = await pool.connect();
//     let currencyReturned;
//     try {
//       const query = 'SELECT * FROM currencies WHERE id = $1';
//       const values = [currency];

//       const {rows} = await client.query(query, values);

//       if (rows.length === 0) {
//         throw new AppError('Currency does not exist in database', 404);
//       }

//       currencyReturned = rows[0];

//       console.log('this is currency returned');
//       console.log(currencyReturned);
//       // Now you can use currencyReturned for further processing
//     } catch (error) {
//       // Handle any errors
//       return next(error);
//     }
//     try {
//       // start transactions
//       // create the expense document
//       // create all the neccessary expense_participants row

//       // const transQuery =
//       //   'BEGIN; INSERT INTO expenses (creator_id, cost_of_expense, currency_id, currency_code, description, status, should_be_reviewed) VALUES ($1, $2, $3, $4, $5, $6, $7); SELECT lastval() INTO expense_id; -- Step 2: Add multiple expense_participant rows INSERT INTO expense_participants (user_id, expense_id, amount_to_pay, currency_id, currency_code, has_paid, created_at) VALUES (<user_id_1>, expense_id, <amount_to_pay_1>, <currency_id_1>, <currency_code_1>, <has_paid_1>, CURRENT_TIMESTAMP), (<user_id_2>, expense_id, <amount_to_pay_2>, <currency_id_2>, <currency_code_2>, <has_paid_2>, CURRENT_TIMESTAMP), -- Add more rows as needed (<user_id_n>, expense_id, <amount_to_pay_n>, <currency_id_n>, <currency_code_n>, <has_paid_n>, CURRENT_TIMESTAMP); -- Commit the transaction COMMIT;';
//       // const transValues = [
//       //   req?.user?.id,
//       //   costOfExpense,
//       //   currency,
//       //   rows[0].currency_code,
//       //   description,
//       //   'pending',
//       //   false,
//       // ];

//       const expId: string = ulid();

//       let sqlString = ``;
//       //start transaction
//       sqlString += 'BEGIN; ';
//       //create expense document
//       console.log(req.currentUser);

//       // sqlString =
//       //   sqlString +
//       //   `INSERT INTO expenses (creator_id, cost_of_expense, currency_id, currency_code, description, status, should_be_reviewed) VALUES (${req
//       //     ?.currentUser
//       //     ?.id}, ${costOfExpense}, ${currency}, ${currencyReturned?.currency_code}, ${description}, pending, ${false});`;

//       // sqlString = sqlString + 'SELECT lastval() INTO expense_id;';

//       // Object.entries(participants).forEach(([userId, participant]) => {
//       //   //const {amount_to_pay} = participant;
//       //   sqlString += `INSERT INTO expense_participants (user_id, expense_id, amount_to_pay, currency_id, currency_code, has_paid, created_at) VALUES (${userId}, expense_id, ${participant}, ${currency},  ${currencyReturned?.currency_code}, ${false}, CURRENT_TIMESTAMP);`;
//       // });

//       // sqlString += 'COMMIT;';

//       sqlString += `
//     INSERT INTO expenses (id, creator_id, cost_of_expense, currency_id, currency_code, description, status, should_be_reviewed)
//     VALUES ('${expId}', ${req?.currentUser
//       ?.id}, ${costOfExpense}, ${currency}, '${currencyReturned?.currency_code}', '${description}', 'pending', ${false});
// `;

//       Object.entries(participants).forEach(([userId, participant]) => {
//         console.log(participant);
//         sqlString += `
//         INSERT INTO expense_participants (user_id, expense_id, amount_to_pay, currency_id, currency_code, has_paid, created_at)
//         VALUES (${userId}, '${expId}', ${participant}, ${currency}, '${currencyReturned?.currency_code}', ${false}, CURRENT_TIMESTAMP);
//     `;
//       });

//       sqlString += 'COMMIT;';

//       console.log(sqlString);

//       client.query(sqlString, (error: Error, results) => {
//         if (error) {
//           console.log('there is an error');
//           console.log(error);
//           return next(error);
//         } else {
//           //console.log(results);
//           res.status(200).json({
//             message: 'successfully created expense',
//           });
//         }
//       });
//     } catch (error) {
//       // console.log('there is an error');
//       // console.log(error);
//       return next(error);
//     }
//   }
// );

const createExpense = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {costOfExpense, currency, description, participants} = req.body;

    // Validation checks
    expenseServices.validateExpenseInput(
      costOfExpense,
      currency,
      description,
      participants,
      next
    );

    // Fetch currency details
    const currencyReturned = await expenseServices.getCurrencyDetails(
      currency,
      next
    );

    // ensure all participants are friends with expense creator
    // const isFriendsWithParticipants = userServices.confirmIsFriendsWith(
    //   req?.currentUser?.id,
    //   participants
    // );

    try {
      const expId: string = ulid();

      // Start building SQL string for transaction
      const sqlString = expenseServices.buildExpenseSQL(
        expId,
        req,
        costOfExpense,
        currency,
        currencyReturned,
        description,
        participants
      );

      // Execute the transaction
      const client = await pool.connect();

      client.query(sqlString, (error: Error) => {
        client.release();
        if (error) {
          return next(error);
        } else {
          res.status(200).json({
            message: 'Successfully created expense',
          });
        }
      });
    } catch (error) {
      return next(error);
    }
  }
);

//add user to contacts
//

export default {createExpense};
