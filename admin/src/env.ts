import { object, parse, string } from 'valibot';

const schema = object({
	VITE_API_URL: string(),
});

export const env = parse(schema, import.meta.env);
