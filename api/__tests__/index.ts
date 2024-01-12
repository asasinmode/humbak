import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import { finished } from 'node:stream/promises';
import { spec } from 'node:test/reporters';
import { run } from 'node:test';
import { env } from 'src/env';

if (env.NODE_ENV !== 'test') {
	throw new Error('tests cannot be run in non-test environment');
}

const dirname = fileURLToPath(new URL('.', import.meta.url));

const stream = run({
	files: [
		`${dirname}/dirDeleteValidation.test.ts`,
		`${dirname}/dirEditValidation.test.ts`,
		`${dirname}/fileEditValidation.test.ts`,
	],
	only: process.argv.includes('--test-only'),
	concurrency: true,
	setup() {
		console.log('tests setup');
	},
}).compose(new spec()); /* eslint-disable-line new-cap */

stream.pipe(process.stdout);

await finished(stream);

console.log('finished running tests');
