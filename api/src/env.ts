import process from 'node:process';
import { config } from 'dotenv';
import * as v from 'valibot';

config({
	path: process.env.NODE_ENV === 'test'
		? '.env.test'
		: process.env.NODE_ENV === 'production'
			? '.env.production'
			: '.env.development',
});

const schema = v.object({
	NODE_ENV: v.picklist(['production', 'development', 'test']),
	PORT: v.pipe(v.string(), v.transform(Number), v.integer()),
	DATABASE_URL: v.string(),
	DATABASE_NAME: v.string(),
	API_URL: v.optional(v.string()),
	ADMIN_URL: v.string(),
	PAGE_URL: v.string(),
	FILES_PATH: v.string(),
	STYLESHEETS_PATH: v.string(),
	DEFAULT_LANGUAGE: v.string(),
	JWT_SECRET: v.string(),
});

export const env = v.parse(schema, process.env);
