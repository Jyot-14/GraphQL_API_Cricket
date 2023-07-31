"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
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
    }
    else {
        console.log('Database connected!');
        done();
    }
});
exports.default = pool;
//# sourceMappingURL=db.js.map