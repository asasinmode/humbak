import { config } from 'dotenv';
import { z } from 'zod';

config({
	path: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
});

const schema = z.object({
	NODE_ENV: z.enum(['production', 'development']),
	DATABASE_URL: z.string(),
});

const parseResults = schema.safeParse(process.env);

if (!parseResults.success) {
	console.error('invalid env', JSON.stringify(parseResults.error.format(), null, 4));

	process.exit(1);
}

export const env = parseResults.data;
