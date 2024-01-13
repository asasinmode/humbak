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
import { createFiles, getCreatedFiles } from './helpers';

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

		const [{ insertId: dirInsertId }] = await db.insert(directories).values([
			{ parentId: null, name: '1', path: `${dirPath}/1` },
		]);
		await db.insert(directories).values([
			{ parentId: dirInsertId, name: '2', path: `${dirPath}/1/2` },
		]);
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/1/tmp1`, name: 'tmp1' },
			{ directoryId: dirInsertId + 1, path: `${dirPath}/1/2/tmp2`, name: 'tmp2' },
		]));

		const { createdDirs, createdDirsArray, createdDirIds, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 2,
			fileInsertId,
			fileCount: 2,
		});

		await processEditedDirs([
			{ id: dirInsertId, parentId: null, name: 'one', originalIndex: 0 },
			{ id: dirInsertId + 1, parentId: dirInsertId, name: 'two', originalIndex: 1 },
		], createdDirs, createdDirsArray, new Set(), `${dirPath}/`);

		const dirsSearchResult = await getUpdatedDirs(createdDirIds);
		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		const updatedDir1 = { id: dirInsertId, parentId: null, name: 'one', path: `${dirPath}/one` };
		assert.deepStrictEqual(dirsSearchResult.find(d => d.id === dirInsertId), updatedDir1);
		assert.deepStrictEqual(createdDirs.get(dirInsertId), updatedDir1);
		assert.deepStrictEqual(createdDirsArray.find(d => d.id === dirInsertId), updatedDir1);
		assert.strictEqual(existsSync(`${testFilesPath}/1`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/one`), true);

		const updatedDir2 = { id: dirInsertId + 1, parentId: dirInsertId, name: 'two', path: `${dirPath}/one/two` };
		assert.deepStrictEqual(dirsSearchResult.find(d => d.id === dirInsertId + 1), updatedDir2);
		assert.deepStrictEqual(createdDirs.get(dirInsertId + 1), updatedDir2);
		assert.deepStrictEqual(createdDirsArray.find(d => d.id === dirInsertId + 1), updatedDir2);
		assert.strictEqual(existsSync(`${testFilesPath}/one/2`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/one/two`), true);

		assert.deepStrictEqual(
			filesSearchResult.find(f => f.id === fileInsertId),
			{ ...createdFiles.get(fileInsertId), path: `${dirPath}/one/tmp1` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/one/tmp1`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(f => f.id === fileInsertId + 1),
			{ ...createdFiles.get(fileInsertId + 1), path: `${dirPath}/one/two/tmp2` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/one/two/tmp2`), true);
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
