import pg from 'pg';
const Pool = pg.Pool;

console.log(
  process.env.DB_USER,
  process.env.DB_HOST,
  process.env.DB_DATABASE,
  process.env.DB_PASSWORD
);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string),
});

export default pool;
