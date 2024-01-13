import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { filesStoragePath } from 'src/helpers/files';
import { db, pool } from 'src/db';
import { directories } from 'src/db/schema/directories';
import { files } from 'src/db/schema/files';
import { inArray } from 'drizzle-orm';
import { processEditedDirs } from 'src/helpers/files/dirEditProcessing';
import { createDirectories, createFiles, getCreatedFiles } from './helpers';

const dirPath = '/dirEditProcessing';
const testFilesPath = `${filesStoragePath}${dirPath}`;

test('dir edit processing', { only: true }, async (t) => {
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

	await t.test('renames dirs', async () => {
		await mkdir(`${testFilesPath}/1`);
		await mkdir(`${testFilesPath}/1/2`);
		await writeFile(`${testFilesPath}/1/tmp1`, '');
		await writeFile(`${testFilesPath}/1/2/tmp2`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/1` },
		]));
		await db.insert(directories).values(createDirectories([
			{ parentId: dirInsertId, path: `${dirPath}/1/2` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/1/tmp1` },
			{ directoryId: dirInsertId + 1, path: `${dirPath}/1/2/tmp2` },
		]));

		const { createdDirs, createdDirsArray, createdDirIds, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 2,
			fileInsertId,
			fileCount: 2,
		});
		const allDirs = structuredClone(createdDirs);

		await processEditedDirs([
			{ id: dirInsertId, parentId: null, name: 'one', originalIndex: 0 },
		], allDirs, createdDirsArray, new Set(), `${dirPath}/`);

		const dirsSearchResult = await getUpdatedDirs(createdDirIds);
		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		assert.deepStrictEqual(
			dirsSearchResult.find(d => d.id === dirInsertId),
			{ ...createdDirs.get(dirInsertId), parentId: null, name: 'one', path: `${dirPath}/one` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/1`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/one`), true);
		// assert.deepStrictEqual(
		// 	filesSearchResult.find(f => f.id === fileInsertId),
		// 	{ ...createdFiles.get(fileInsertId), directoryId: dirInsertId, name: 'tmpOne', path: `${dirPath}/1/tmpOne` }
		// );
		// assert.strictEqual(existsSync(`${testFilesPath}/1/tmp1`), false);
		// assert.strictEqual(existsSync(`${testFilesPath}/1/tmpOne`), true);
	});

	// 	await t.test('skips nonexistent old path', async (t) => {
	// 		assert.equal(1, 1);
	// 	});

	// 	await t.test('skips nonexistent new path', async (t) => {
	// 		assert.equal(1, 1);
	// 	});

	// 	await t.test('updates subfolders\' paths', async (t) => {
	// 		assert.equal(1, 1);
	// 	});

	// 	await t.test('updates child files\' paths', async (t) => {
	// 		assert.equal(1, 1);
	// 	});

	// 	await t.test('multiple nested', async (t) => {
	// 		assert.equal(1, 1);
	// 	});

	// 	await t.test('returns associated pages\' ids', async (t) => {
	// 		assert.equal(1, 1);
	// 	});
});

function getUpdatedFiles(ids: number[]) {
	return db
		.select({
			id: files.id,
			directoryId: files.directoryId,
			path: files.path,
			name: files.name,
			title: files.title,
			alt: files.alt,
		})
		.from(files)
		.where(inArray(files.id, ids));
}

function getUpdatedDirs(ids: number[]) {
	return db
		.select({
			id: directories.id,
			parentId: directories.parentId,
			path: directories.path,
			name: directories.name,
		})
		.from(directories)
		.where(inArray(directories.id, ids));
}
