import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_user,
  host: process.env.DB_host,
  database: process.env.DB_database,
  password: process.env.DB_password,
  port: Number(process.env.DB_port),
});

// Attempt to connect to the database
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Database connected!');
    done();
  }
});

export default pool;
