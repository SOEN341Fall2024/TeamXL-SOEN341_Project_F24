// db.config.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export const createDbConnection = () => {
  return new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
};

