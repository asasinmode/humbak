import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { filesStoragePath } from 'src/helpers/files';
import { processDeletedFiles } from 'src/helpers/files/fileDeleteProcessing';
import { db } from 'src/db';
import { directories } from 'src/db/schema/directories';
import { files } from 'src/db/schema/files';
import { inArray } from 'drizzle-orm';
import { createDirectories, createFiles } from './helpers';

const dirPath = '/fileEditValidation';
const testFilesPath = `${filesStoragePath}${dirPath}`;

test('file edit validation', { concurrency: false, only: true }, async (t) => {
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

	await t.test('deletes files', async () => {
		await mkdir(`${testFilesPath}/1`);
		await writeFile(`${testFilesPath}/1/tmp`, '');
		await writeFile(`${testFilesPath}/tmp`, '');

		await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/1` },
		]));
		const [{ insertId }] = await db.insert(files).values(createFiles([
			{ directoryId: 1, path: `${dirPath}/1/tmp` },
			{ directoryId: null, path: `${dirPath}/tmp` },
		]));

		const ids = [insertId, insertId + 1];
		const modifiedFileIds = new Set<number>();

		await processDeletedFiles(ids, modifiedFileIds);

		const filesSearchResult = await db.select({ id: files.id }).from(files).where(inArray(files.id, ids));

		assert.deepStrictEqual(filesSearchResult, []);
		assert.deepStrictEqual(modifiedFileIds, new Set(ids));
		assert.strictEqual(existsSync(`${testFilesPath}/1/tmp`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/tmp`), false);
	});

	await t.test('deletes when not in file system', { todo: true }, async () => {
		assert.equal(1, 1);
	});

	await t.test('return associated pages\' ids', { todo: true }, async () => {
		assert.equal(1, 1);
	});
});
