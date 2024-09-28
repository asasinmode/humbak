import process from 'node:process';
import { finished } from 'node:stream/promises';
import { run } from 'node:test';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { spec } from 'node:test/reporters';
import { db, pool } from 'src/db';
import { env } from 'src/env';
import { getTableNames } from 'src/helpers';

if (env.NODE_ENV !== 'test') {
	throw new Error('tests cannot be run in non-test environment');
}

const setupStart = performance.now();

const dirname = fileURLToPath(new URL('.', import.meta.url));

await migrate(db, { migrationsFolder: `${dirname}/../src/db/migrations` });
const tables = await getTableNames();
await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
await pool.execute('TRUNCATE TABLE `pages`');
for (const thing of tables.filter(t => t.table_name !== '__drizzle_migrations')) {
	await pool.execute(`TRUNCATE TABLE ${thing.table_name}`);
}
await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

const setupEnd = performance.now();
console.log('finished running setup in', setupEnd - setupStart, '\n');

const stream = run({
	files: [
		`${dirname}/dirDeleteValidation.test.ts`,
		`${dirname}/dirEditValidation.test.ts`,
		`${dirname}/fileEditValidation.test.ts`,
		`${dirname}/fileDeleteProcessing.test.ts`,
		`${dirname}/fileEditProcessing.test.ts`,
		`${dirname}/dirDeleteProcessing.test.ts`,
		`${dirname}/dirEditProcessing.test.ts`,
	],
	only: process.argv.includes('--test-only'),
	concurrency: true,
}).compose(new spec()); /* eslint-disable-line new-cap */

stream.pipe(process.stdout);
await finished(stream);

await pool.end();
