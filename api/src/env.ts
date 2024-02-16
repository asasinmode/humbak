import process from 'node:process';
import { config } from 'dotenv';
import { coerce, integer, number, object, parse, picklist, string } from 'valibot';

config({
	path: process.env.NODE_ENV === 'test'
		? '.env.test'
		: process.env.NODE_ENV === 'production'
			? '.env.production'
			: '.env.development',
});

const schema = object({
	NODE_ENV: picklist(['production', 'development', 'test']),
	PORT: coerce(number([integer()]), Number),
	DATABASE_URL: string(),
	DATABASE_NAME: string(),
	API_URL: string(),
	ADMIN_URL: string(),
	PAGE_URL: string(),
	FILES_PATH: string(),
	STYLESHEETS_PATH: string(),
	DEFAULT_LANGUAGE: string(),
	JWT_SECRET: string(),
});

export const env = parse(schema, process.env);
