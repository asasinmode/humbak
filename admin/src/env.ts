import { object, parse, string } from 'valibot';

const schema = object({
	VITE_API_URL: string(),
	VITE_PAGE_URL: string(),
	VITE_DEFAULT_LANGUAGE: string(),
});

export const env = parse(schema, import.meta.env);
