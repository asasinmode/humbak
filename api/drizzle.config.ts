import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/db/schema',
	out: './src/db/migrations',
});
