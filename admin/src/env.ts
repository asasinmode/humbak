import { object, string } from 'valibot';

const schema = object({
	VITE_API_URL: string(),
});

export const env = schema.parse(import.meta.env);
