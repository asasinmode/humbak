import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '~/env';

const poolConnection = mysql.createPool({
	host: env.DATABASE_HOST,
	user: env.DATABASE_USER,
	password: env.DATABASE_PASSWORD,
	database: env.DATABASE_DATABASE,
});

export const db = drizzle(poolConnection);
