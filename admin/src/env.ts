import * as v from 'valibot';

const schema = v.object({
	VITE_API_URL: v.string(),
	VITE_PAGE_URL: v.string(),
	VITE_DEFAULT_LANGUAGE: v.string(),
});

export const env = v.parse(schema, import.meta.env);
