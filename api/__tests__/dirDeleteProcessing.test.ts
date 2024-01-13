import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { filesStoragePath } from 'src/helpers/files';
import { db, pool } from 'src/db';
import { directories } from 'src/db/schema/directories';
import { files } from 'src/db/schema/files';
import { inArray } from 'drizzle-orm';
import { processDeletedDirs } from 'src/helpers/files/dirDeleteProcessing';
import { filesToPages } from 'src/db/schema/filesToPages';
import { pages } from 'src/db/schema/pages';
import { createDirectories, createFiles, getCreatedFiles } from './helpers';

const dirPath = '/dirDeleteProcessing';
const testFilesPath = `${filesStoragePath}${dirPath}`;

test('dir delete processing', { only: true }, async (t) => {
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

	await t.test('deletes dirs', async () => {
		await mkdir(`${testFilesPath}/1`);
		await mkdir(`${testFilesPath}/1/2`);
		await writeFile(`${testFilesPath}/1/tmp`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/1` },
		]));
		await db.insert(directories).values(createDirectories([{ parentId: dirInsertId, path: `${dirPath}/1/2` }]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/1/tmp` },
		]));

		const { createdDirs, createdDirsArray, createdDirIds, createdFileIds } = await getCreatedFiles({
			fileInsertId,
			fileCount: 1,
			dirInsertId,
			dirCount: 2,
		});
		const allDirs = structuredClone(createdDirs);

		await processDeletedDirs(createdDirs, allDirs, createdDirsArray, new Set());

		const dirSearchResult = await db
			.select({ id: directories.id })
			.from(directories)
			.where(inArray(directories.id, createdDirIds));
		const filesSearchResult = await db
			.select({ id: files.id })
			.from(files)
			.where(inArray(files.id, createdFileIds));

		assert.deepStrictEqual(filesSearchResult, []);
		assert.deepStrictEqual(dirSearchResult, []);
		assert.deepStrictEqual(allDirs, new Map());
		assert.deepStrictEqual(createdDirsArray, []);
		assert.strictEqual(existsSync(`${testFilesPath}/1`), false);
	});

	await t.test('deletes when not in file system', async () => {
		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/3` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/3/tmp` },
		]));

		const { createdDirs, createdDirsArray, createdDirIds, createdFileIds } = await getCreatedFiles({
			fileInsertId,
			fileCount: 1,
			dirInsertId,
			dirCount: 1,
		});
		const allDirs = structuredClone(createdDirs);

		await processDeletedDirs(createdDirs, allDirs, createdDirsArray, new Set());

		const dirSearchResult = await db
			.select({ id: directories.id })
			.from(directories)
			.where(inArray(directories.id, createdDirIds));
		const filesSearchResult = await db
			.select({ id: files.id })
			.from(files)
			.where(inArray(files.id, createdFileIds));

		assert.deepStrictEqual(filesSearchResult, []);
		assert.deepStrictEqual(dirSearchResult, []);
		assert.deepStrictEqual(allDirs, new Map());
		assert.deepStrictEqual(createdDirsArray, []);
	});

	await t.test('updates modified pages\' ids', async () => {
		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/2` },
			{ parentId: null, path: `${dirPath}/3` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/2/tmp` },
		]));
		const [{ insertId: pageInsertId }] = await db.insert(pages).values([
			{ language: 'en', title: `${dirPath}2`, slug: `${dirPath}2` },
			{ language: 'en', title: `${dirPath}3`, slug: `${dirPath}3` },
		]);
		await db.insert(filesToPages).values([
			{ pageId: pageInsertId, fileId: fileInsertId },
		]);

		const { createdDirs, createdDirsArray } = await getCreatedFiles({ fileInsertId, fileCount: 1, dirInsertId, dirCount: 2 });
		const allDirs = structuredClone(createdDirs);

		const modifiedPagesIds = new Set<number>();

		await processDeletedDirs(
			new Map([[dirInsertId, createdDirs.get(dirInsertId)!]]),
			allDirs,
			createdDirsArray,
			modifiedPagesIds
		);

		assert.deepStrictEqual(modifiedPagesIds, new Set([pageInsertId]));
		assert.deepStrictEqual(allDirs, new Map([[dirInsertId + 1, createdDirs.get(dirInsertId + 1)]]));
	});
});
