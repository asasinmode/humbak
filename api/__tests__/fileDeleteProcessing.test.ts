import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { filesStoragePath } from 'src/helpers/files';
import { processDeletedFiles } from 'src/helpers/files/fileDeleteProcessing';
import { db, pool } from 'src/db';
import { directories } from 'src/db/schema/directories';
import { files } from 'src/db/schema/files';
import { inArray } from 'drizzle-orm';
import { pages } from 'src/db/schema/pages';
import { filesToPages } from 'src/db/schema/filesToPages';
import { createDirectories, createFiles, getCreatedFiles } from './helpers';

const dirPath = '/fileDeleteProcessing';
const testFilesPath = `${filesStoragePath}${dirPath}`;

test('file delete processing', { only: true }, async (t) => {
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
		await pool.end();
	});

	await t.test('deletes files', async () => {
		await mkdir(`${testFilesPath}/1`);
		await writeFile(`${testFilesPath}/1/tmp`, '');
		await writeFile(`${testFilesPath}/tmp`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/1` },
		]));
		const [{ insertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/1/tmp` },
			{ directoryId: null, path: `${dirPath}/tmp` },
		]));

		const deletedFilesIds = [insertId, insertId + 1];

		await processDeletedFiles(deletedFilesIds, new Set());

		const filesSearchResult = await db
			.select({ id: files.id })
			.from(files)
			.where(inArray(files.id, deletedFilesIds));

		assert.deepStrictEqual(filesSearchResult, []);
		assert.strictEqual(existsSync(`${testFilesPath}/1/tmp`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/tmp`), false);
	});

	await t.test('deletes when not in file system', async () => {
		const [{ insertId }] = await db.insert(files).values(createFiles([
			{ directoryId: null, path: `${dirPath}/tmp` },
		]));

		const deletedFilesIds = [insertId];

		await processDeletedFiles(deletedFilesIds, new Set());

		const filesSearchResult = await db
			.select({ id: files.id })
			.from(files)
			.where(inArray(files.id, deletedFilesIds));

		assert.deepStrictEqual(filesSearchResult, []);
	});

	await t.test('updates modified pages\' ids', async () => {
		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/2` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/2/tmp` },
			{ directoryId: null, path: `${dirPath}/tmp` },
		]));
		const [{ insertId: pageInsertId }] = await db.insert(pages).values([
			{ language: 'en', title: `${dirPath}1`, slug: `${dirPath}1` },
			{ language: 'en', title: `${dirPath}2`, slug: `${dirPath}2` },
		]);
		await db.insert(filesToPages).values([
			{ pageId: pageInsertId, fileId: fileInsertId },
			{ pageId: pageInsertId + 1, fileId: fileInsertId + 1 },
		]);

		const { createdFileIds } = await getCreatedFiles({ dirInsertId, dirCount: 1, fileInsertId, fileCount: 2 });

		const modifiedPagesIds = new Set<number>();

		await processDeletedFiles(createdFileIds, modifiedPagesIds);

		assert.deepStrictEqual(modifiedPagesIds, new Set([pageInsertId, pageInsertId + 1]));
	});
});
