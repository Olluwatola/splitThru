import path = require('path');
import dotenv from 'dotenv';

dotenv.config({path: path.resolve(__dirname, '../../.env')});

const {
  NODE_ENV,
  DB_USER,
  DB_HOST,
  DB_DATABASE,
  DB_PASSWORD,
  DB_PORT,
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} = process.env;

export {
  NODE_ENV,
  DB_USER,
  DB_HOST,
  DB_DATABASE,
  DB_PASSWORD,
  DB_PORT,
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
