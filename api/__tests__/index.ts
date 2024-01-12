import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import { finished } from 'node:stream/promises';
import { spec } from 'node:test/reporters';
import { run } from 'node:test';

const dirname = fileURLToPath(new URL('.', import.meta.url));

const stream = run({
	files: [
		`${dirname}/dirDeleteValidation.test.ts`,
	],
	only: process.argv.includes('--test-only'),
	setup() {
		console.log('tests setup');
	},
}).compose(new spec()); /* eslint-disable-line new-cap */

stream.pipe(process.stdout);

await finished(stream);

console.log('finished running tests');
