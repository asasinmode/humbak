import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import { finished } from 'node:stream/promises';
import { spec } from 'node:test/reporters';
import { run } from 'node:test';
import { env } from 'src/env';
import { filesStoragePath, stylesheetsStoragePath } from 'src/helpers/files';

if (env.NODE_ENV !== 'test') {
	throw new Error('tests cannot be run in non-test environment');
}

const dirname = fileURLToPath(new URL('.', import.meta.url));

console.log({ filesStoragePath, stylesheetsStoragePath, dirname });

const stream = run({
	files: [
		// `${dirname}/dirDeleteValidation.test.ts`,
		// `${dirname}/dirEditValidation.test.ts`,
		// `${dirname}/fileEditValidation.test.ts`,
		`${dirname}/fileDeleteProcessing.test.ts`,
	],
	only: process.argv.includes('--test-only'),
	concurrency: true,
}).compose(new spec()); /* eslint-disable-line new-cap */

stream.pipe(process.stdout);

await finished(stream);

console.log('finished running tests');
