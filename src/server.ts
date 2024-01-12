//import dotenv from 'dotenv';
import app from './app';
import {PORT} from './config/envConfig';

//import path = require('path');

// dotenv.config({path: path.resolve(__dirname, '../.env')});

// console.log(dotenv.config({path: path.resolve(__dirname, '../.env')}));

const port: string | number = parseInt(PORT as string) || 5656;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
