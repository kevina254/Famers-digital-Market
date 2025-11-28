import dotenv from "dotenv";
import assert from "assert";
import sql from "mssql";

dotenv.config();

const { SQL_SERVER, SQL_USER, SQL_PWD, SQL_DB } = process.env;

// Ensure all required environment variables exist
assert(SQL_SERVER, "SQL_SERVER is required");
assert(SQL_USER, "SQL_USER is required");
assert(SQL_PWD, "SQL_PWD is required");
assert(SQL_DB, "SQL_DB is required");

const sqlConfig: sql.config = {
  user: SQL_USER,
  password: SQL_PWD,
  database: SQL_DB,
  server: SQL_SERVER!,
  port: 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true, // true for local development
  },
};

//  Connection pool creator
export const getPool = async (): Promise<sql.ConnectionPool> => {
  try {
    const pool = await sql.connect(sqlConfig);
    console.log(" Connected to SQL Server");
    return pool;
  } catch (error) {
    console.error(" SQL Connection Error:", error);
    throw error;
  }
};

export default sql;
export  {sqlConfig};
