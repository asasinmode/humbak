import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { inArray } from 'drizzle-orm';
import { processEditedDirs } from '../layers/admin/server/utils/dirEditProcessing';
import { createFiles, getCreatedFiles } from './helpers';

const { directories, files, filesToPages, filesToSlides, pages, slides } = tables;

const dirPath = '/dirEditProcessing';
const testFilesPath = `${filesStoragePath}${dirPath}`;

test('dir edit processing', async (t) => {
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

		const [{ insertId: dirInsertId }] = await db.insert(directories).values({
			parentId: null,
			name: '1',
			path: `${dirPath}/1`,
		});
		await db.insert(directories).values({ parentId: dirInsertId, name: '2', path: `${dirPath}/1/2` });
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
		], createdDirs, createdDirsArray, new Set(), new Set(), `${dirPath}/`);

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
			{ ...createdFiles.get(fileInsertId), path: `${dirPath}/one/tmp1` },
		);
		assert.strictEqual(existsSync(`${testFilesPath}/one/tmp1`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(f => f.id === fileInsertId + 1),
			{ ...createdFiles.get(fileInsertId + 1), path: `${dirPath}/one/two/tmp2` },
		);
		assert.strictEqual(existsSync(`${testFilesPath}/one/two/tmp2`), true);
	});

	await t.test('moves dirs', async () => {
		await mkdir(`${testFilesPath}/3`);
		await mkdir(`${testFilesPath}/4`);
		await mkdir(`${testFilesPath}/3/5`);
		await mkdir(`${testFilesPath}/3/5/6`);
		await writeFile(`${testFilesPath}/4/tmp4`, '');
		await writeFile(`${testFilesPath}/3/5/tmp5`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values([
			{ parentId: null, name: '3', path: `${dirPath}/3` },
			{ parentId: null, name: '4', path: `${dirPath}/4` },
		]);
		await db.insert(directories).values({ parentId: dirInsertId, name: '5', path: `${dirPath}/3/5` });
		await db.insert(directories).values({ parentId: dirInsertId + 2, name: '6', path: `${dirPath}/3/5/6` });
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId + 1, path: `${dirPath}/4/tmp4`, name: 'tmp4' },
			{ directoryId: dirInsertId + 2, path: `${dirPath}/3/5/tmp5`, name: 'tmp5' },
		]));

		const { createdDirs, createdDirsArray, createdDirIds, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 4,
			fileInsertId,
			fileCount: 3,
		});

		await processEditedDirs([
			{ id: dirInsertId + 3, parentId: dirInsertId + 1, name: 'six', originalIndex: 0 },
			{ id: dirInsertId + 1, parentId: dirInsertId, name: 'four', originalIndex: 1 },
			{ id: dirInsertId + 2, parentId: null, name: 'five', originalIndex: 2 },
		], createdDirs, createdDirsArray, new Set(), new Set(), `${dirPath}/`);

		const dirsSearchResult = await getUpdatedDirs(createdDirIds);
		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		const updatedDir1 = { id: dirInsertId + 1, parentId: dirInsertId, name: 'four', path: `${dirPath}/3/four` };
		assert.deepStrictEqual(dirsSearchResult.find(d => d.id === dirInsertId + 1), updatedDir1);
		assert.deepStrictEqual(createdDirs.get(dirInsertId + 1), updatedDir1);
		assert.deepStrictEqual(createdDirsArray.find(d => d.id === dirInsertId + 1), updatedDir1);
		assert.strictEqual(existsSync(`${testFilesPath}/4`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/3/four`), true);

		const updatedDir2 = { id: dirInsertId + 2, parentId: null, name: 'five', path: `${dirPath}/five` };
		assert.deepStrictEqual(dirsSearchResult.find(d => d.id === dirInsertId + 2), updatedDir2);
		assert.deepStrictEqual(createdDirs.get(dirInsertId + 2), updatedDir2);
		assert.deepStrictEqual(createdDirsArray.find(d => d.id === dirInsertId + 2), updatedDir2);
		assert.strictEqual(existsSync(`${testFilesPath}/3/5`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/five`), true);

		const updatedDir3 = { id: dirInsertId + 3, parentId: dirInsertId + 1, name: 'six', path: `${dirPath}/3/four/six` };
		assert.deepStrictEqual(dirsSearchResult.find(d => d.id === dirInsertId + 3), updatedDir3);
		assert.deepStrictEqual(createdDirs.get(dirInsertId + 3), updatedDir3);
		assert.deepStrictEqual(createdDirsArray.find(d => d.id === dirInsertId + 3), updatedDir3);
		assert.strictEqual(existsSync(`${testFilesPath}/five/6`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/3/four/six`), true);

		assert.deepStrictEqual(
			filesSearchResult.find(f => f.id === fileInsertId),
			{ ...createdFiles.get(fileInsertId), path: `${dirPath}/3/four/tmp4` },
		);
		assert.strictEqual(existsSync(`${testFilesPath}/3/four/tmp4`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(f => f.id === fileInsertId + 1),
			{ ...createdFiles.get(fileInsertId + 1), path: `${dirPath}/five/tmp5` },
		);
		assert.strictEqual(existsSync(`${testFilesPath}/five/tmp5`), true);
	});

	await t.test('skips not found in all', async () => {
		await mkdir(`${testFilesPath}/7`);
		await mkdir(`${testFilesPath}/7/8`);
		await writeFile(`${testFilesPath}/7/8/tmp6`, '');
		await writeFile(`${testFilesPath}/7/tmp7`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values([
			{ parentId: null, name: '7', path: `${dirPath}/7` },
		]);
		await db.insert(directories).values({ parentId: dirInsertId, name: '8', path: `${dirPath}/7/8` });
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId + 1, path: `${dirPath}/7/8/tmp6`, name: 'tmp6' },
			{ directoryId: dirInsertId, path: `${dirPath}/7/tmp7`, name: 'tmp7' },
		]));
		const [{ insertId: pageInsertId }] = await db.insert(pages).values([
			{ language: 'en', title: `${dirPath}1`, slug: `${dirPath}1` },
			{ language: 'en', title: `${dirPath}2`, slug: `${dirPath}2` },
		]);
		await db.insert(filesToPages).values([
			{ pageId: pageInsertId, fileId: fileInsertId },
			{ pageId: pageInsertId + 1, fileId: fileInsertId + 1 },
		]);

		const { createdDirs, createdDirsArray } = await getCreatedFiles({
			dirInsertId,
			dirCount: 2,
			fileInsertId,
			fileCount: 2,
		});
		createdDirs.delete(dirInsertId + 1);

		const modifiedPagesIds = new Set<number>();

		await processEditedDirs([
			{ id: dirInsertId, parentId: null, name: 'seven', originalIndex: 0 },
			{ id: dirInsertId + 1, parentId: dirInsertId, name: 'eight', originalIndex: 1 },
		], createdDirs, createdDirsArray, modifiedPagesIds, new Set(), `${dirPath}/`);

		const dirsSearchResult = await getUpdatedDirs([dirInsertId + 1]);

		assert.deepStrictEqual(
			dirsSearchResult[0],
			{ id: dirInsertId + 1, parentId: dirInsertId, name: '8', path: `${dirPath}/seven/8` },
		);
		assert.deepStrictEqual(modifiedPagesIds, new Set([pageInsertId + 1]));
	});

	await t.test('skips not found in all array', async () => {
		await mkdir(`${testFilesPath}/9`);
		await mkdir(`${testFilesPath}/9/10`);
		await writeFile(`${testFilesPath}/9/tmp8`, '');
		await writeFile(`${testFilesPath}/9/10/tmp9`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values([
			{ parentId: null, name: '9', path: `${dirPath}/9` },
		]);
		await db.insert(directories).values({ parentId: dirInsertId, name: '10', path: `${dirPath}/9/10` });
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/9/tmp8`, name: 'tmp8' },
			{ directoryId: dirInsertId + 1, path: `${dirPath}/9/10/tmp9`, name: 'tmp9' },
		]));
		const [{ insertId: pageInsertId }] = await db.insert(pages).values([
			{ language: 'en', title: `${dirPath}3`, slug: `${dirPath}3` },
			{ language: 'en', title: `${dirPath}4`, slug: `${dirPath}4` },
		]);
		await db.insert(filesToPages).values([
			{ pageId: pageInsertId, fileId: fileInsertId + 1 },
			{ pageId: pageInsertId + 1, fileId: fileInsertId },
		]);

		const { createdDirs, createdDirsArray } = await getCreatedFiles({
			dirInsertId,
			dirCount: 2,
			fileInsertId,
			fileCount: 2,
		});

		const modifiedPagesIds = new Set<number>();

		await processEditedDirs(
			[
				{ id: dirInsertId + 1, parentId: dirInsertId, name: 'ten', originalIndex: 0 },
				{ id: dirInsertId, parentId: null, name: 'nine', originalIndex: 1 },
			],
			createdDirs,
			createdDirsArray.filter(d => d.id !== dirInsertId),
			modifiedPagesIds,
			new Set(),
			`${dirPath}/`,
		);

		const dirsSearchResult = await getUpdatedDirs([dirInsertId]);

		assert.deepStrictEqual(
			dirsSearchResult[0],
			{ id: dirInsertId, parentId: null, name: '9', path: `${dirPath}/9` },
		);
		assert.deepStrictEqual(modifiedPagesIds, new Set([pageInsertId]));
	});

	await t.test('skips nonexistent old path', async () => {
		await mkdir(`${testFilesPath}/12`);
		await writeFile(`${testFilesPath}/12/tmp9`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values([
			{ parentId: null, name: '11', path: `${dirPath}/11` },
			{ parentId: null, name: '12', path: `${dirPath}/12` },
		]);
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId + 1, path: `${dirPath}/12/tmp9`, name: 'tmp9' },
		]));
		const [{ insertId: slideInsertId }] = await db.insert(slides).values([
			{ language: 'en', name: `${dirPath}1` },
			{ language: 'en', name: `${dirPath}2` },
		]);
		await db.insert(filesToSlides).values([
			{ slideId: slideInsertId + 1, fileId: fileInsertId },
		]);

		const { createdDirs, createdDirsArray, createdDirIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 2,
			fileInsertId: 0,
			fileCount: 0,
		});

		const modifiedSlidesIds = new Set<number>();

		await processEditedDirs(
			[
				{ id: dirInsertId, parentId: null, name: 'eleven', originalIndex: 0 },
				{ id: dirInsertId + 1, parentId: null, name: 'twelve', originalIndex: 1 },
			],
			createdDirs,
			createdDirsArray,
			new Set(),
			modifiedSlidesIds,
			`${dirPath}/`,
		);

		const dirsSearchResult = await getUpdatedDirs(createdDirIds);

		assert.deepStrictEqual(
			dirsSearchResult[0],
			{ id: dirInsertId, parentId: null, name: '11', path: `${dirPath}/11` },
		);
		assert.deepStrictEqual(modifiedSlidesIds, new Set([slideInsertId + 1]));
	});

	await t.test('skips nonexistent new path', async () => {
		await mkdir(`${testFilesPath}/13`);

		const [{ insertId: dirInsertId }] = await db.insert(directories).values([
			{ parentId: null, name: '13', path: `${dirPath}/13` },
			{ parentId: null, name: '14', path: `${dirPath}/14` },
		]);

		const { createdDirs, createdDirsArray } = await getCreatedFiles({
			dirInsertId,
			dirCount: 2,
			fileInsertId: 0,
			fileCount: 0,
		});

		await processEditedDirs(
			[
				{ id: dirInsertId, parentId: dirInsertId + 1, name: 'thirteen', originalIndex: 0 },
			],
			createdDirs,
			createdDirsArray,
			new Set(),
			new Set(),
			`${dirPath}/`,
		);

		const dirsSearchResult = await getUpdatedDirs([dirInsertId]);

		assert.deepStrictEqual(
			dirsSearchResult[0],
			{ id: dirInsertId, parentId: null, name: '13', path: `${dirPath}/13` },
		);
	});
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
			mimetype: files.mimetype,
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
