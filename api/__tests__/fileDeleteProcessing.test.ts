import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { adminFilesPath } from 'src/helpers/files';

const dirPath = '/__tests__/fileEditValidation';
const testFilesPath = `${adminFilesPath}${dirPath}`;

test('file edit validation', { only: true }, async (t) => {
	before(async () => {
		const exists = existsSync(testFilesPath);
		if (exists) {
			const stats = await lstat(testFilesPath);
			if (stats.isDirectory()) {
				throw new Error('test dir already exists');
			}
		}
		await mkdir(testFilesPath, { recursive: true });
	});

	after(async () => {
		await rm(testFilesPath, { recursive: true });
	});

	await t.test('deletes files', { todo: true }, async () => {
		assert.equal(1, 1);
	});

	await t.test('deletes when not in file system', { todo: true }, async () => {
		assert.equal(1, 1);
	});

	await t.test('return associated pages\' ids', { todo: true }, async () => {
		assert.equal(1, 1);
	});
});
