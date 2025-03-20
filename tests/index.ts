import path from 'node:path';
import process from 'node:process';
import stream from 'node:stream/promises';
import test from 'node:test';
import url from 'node:url';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import testReporters from 'node:test/reporters';
import { getTableNames } from '~~/server/db/scripts';

if (process.env.NODE_ENV !== 'test') {
	throw new Error('tests cannot be run in non-test environment');
}

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

const setupStart = performance.now();

await migrate(db, { migrationsFolder: `${dirname}/../server/db/migrations` });
const tables = await getTableNames();
await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
await pool.execute('TRUNCATE TABLE `pages`');
for (const { table_name } of tables) {
	if (table_name !== '__drizzle_migrations') {
		await pool.execute(`TRUNCATE TABLE ${table_name}`);
	}
}
await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

const setupEnd = performance.now();
console.log('finished running setup in', setupEnd - setupStart, '\n');

const tests = test.run({
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
}).compose(new testReporters.spec()); /* eslint-disable-line new-cap */

tests.pipe(process.stdout);
await stream.finished(tests);

await pool.end();
