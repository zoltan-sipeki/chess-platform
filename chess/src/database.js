import { createPool } from "mariadb";

export const DB = createPool({
    user: process.env.DB_USER_CHESS,
    password: process.env.DB_PASSWORD_CHESS,
    database: "chess_platform",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    rowsAsArray: false,
    connectionLimit: 8
});
