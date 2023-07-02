import { config } from 'dotenv';
import { z } from 'zod';

config({
	path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const schema = z.object({
	NODE_ENV: z.enum(['production', 'development']),
	PORT: z.string().transform(Number),
	DATABASE_HOST: z.string(),
	DATABASE_USER: z.string(),
	DATABASE_PASSWORD: z.string(),
	DATABASE_DATABASE: z.string(),
	ADMIN_URL: z.string(),
});

export const env = schema.parse(process.env);
