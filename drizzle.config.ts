import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'mysql',
	schema: './server/db/schema/',
	out: './server/db/migrations/',
	verbose: true,
});
