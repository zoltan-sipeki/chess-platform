import { createPool } from "mariadb";

const database = createPool({
    user:  process.env.DB_USER_API,
    password: process.env.DB_PASSWORD_API,
    database: "chess_platform",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    rowsAsArray: false,
    connectionLimit: 8
});

export { database as default };