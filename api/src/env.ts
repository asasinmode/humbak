import { config } from 'dotenv';
import { coerce, enumType, integer, number, object, parse, string } from 'valibot';

config({
	path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const schema = object({
	NODE_ENV: enumType(['production', 'development']),
	PORT: coerce(number([integer()]), Number),
	DATABASE_HOST: string(),
	DATABASE_USER: string(),
	DATABASE_PASSWORD: string(),
	DATABASE_DATABASE: string(),
	ADMIN_URL: string(),
	FOOTER_EMAIL: string(),
	FOOTER_PHONE: string(),
	FOOTER_LOCATION: string(),
	FOOTER_FACEBOOK: string(),
});

export const env = parse(schema, process.env);
