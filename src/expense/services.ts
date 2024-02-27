import {Request, NextFunction} from 'express';
import sumNumericProperties from '../utils/sumNumericProperties';
import AppError from '../utils/appError';
import pool from './../db/db';

//create the interface for participants
function validateExpenseInput(
  costOfExpense: number,
  currency: string,
  description: string,
  participants: any,
  next: NextFunction
) {
  if (!costOfExpense || !currency || !description) {
    return next(
      new AppError('Ensure all fields are appropriately filled', 400)
    );
  }
  if (typeof costOfExpense !== 'number') {
    return next(
      new AppError('Ensure the cost of expense inputted is a number', 400)
    );
  }
  if (costOfExpense !== sumNumericProperties(participants, next)) {
    return next(
      new AppError(
        'Ensure the sum of the individual payments of participants equals the cost of expense',
        400
      )
    );
  }
}

async function getCurrencyDetails(currency: string, next: NextFunction) {
  const client = await pool.connect();

  try {
    const query = 'SELECT * FROM currencies WHERE id = $1';
    const values = [currency];

    const {rows} = await client.query(query, values);

    if (rows.length === 0) {
      throw new AppError('Currency does not exist in database', 404);
    }

    return rows[0];
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

function buildExpenseSQL(
  expId: string,
  req: Request,
  costOfExpense: number,
  currency: string,
  currencyReturned: any,
  description: string,
  participants: any
) {
  let sqlString = `BEGIN; `;
  sqlString += `INSERT INTO expenses (id, creator_id, cost_of_expense, currency_id, currency_code, description, status, should_be_reviewed) 
        VALUES ('${expId}', ${req?.currentUser
          ?.id}, ${costOfExpense}, ${currency}, '${currencyReturned?.currency_code}', '${description}', 'pending', ${false});`;

  Object.entries(participants).forEach(
    ([userId, participant]: [string, any]) => {
      sqlString += `INSERT INTO expense_participants (user_id, expense_id, amount_to_pay, currency_id, currency_code, has_paid, created_at) 
            VALUES (${userId}, '${expId}', ${participant}, ${currency}, '${currencyReturned?.currency_code}', ${false}, CURRENT_TIMESTAMP);`;
    }
  );

  sqlString += 'COMMIT;';
  return sqlString;
}

export default {validateExpenseInput, getCurrencyDetails, buildExpenseSQL};
