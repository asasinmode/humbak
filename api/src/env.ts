import { config } from 'dotenv';
import { z } from 'zod';

config({
	path: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
});

const schema = z.object({
	NODE_ENV: z.enum(['production', 'development']),
	PORT: z.string().transform(Number),
	DATABASE_HOST: z.string(),
	DATABASE_USER: z.string(),
	DATABASE_PASSWORD: z.string(),
	DATABASE_DATABASE: z.string(),
});

const parseResults = schema.safeParse(process.env);

if (!parseResults.success) {
	console.error('invalid env', JSON.stringify(parseResults.error.format(), null, 4));

	process.exit(1);
}

export const env = parseResults.data;
