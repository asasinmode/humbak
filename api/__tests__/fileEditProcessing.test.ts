import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { filesStoragePath } from 'src/helpers/files';
import { db, pool } from 'src/db';
import { directories } from 'src/db/schema/directories';
import { files } from 'src/db/schema/files';
import { inArray } from 'drizzle-orm';
import { processEditedFiles } from 'src/helpers/files/fileEditProcessing';
import { createDirectories, createFiles, createProcessedInputFiles, getCreatedFiles } from './helpers';

const dirPath = '/fileEditProcessing';
const testFilesPath = `${filesStoragePath}${dirPath}`;

test('file edit processing', async (t) => {
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

	await t.test('renames files', async () => {
		await mkdir(`${testFilesPath}/1`);
		await writeFile(`${testFilesPath}/1/tmp1`, '');
		await writeFile(`${testFilesPath}/tmp2`, '');
		await writeFile(`${testFilesPath}/tmp3`, '');
		await writeFile(`${testFilesPath}/1/tmp4`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/1` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId, path: `${dirPath}/1/tmp1` },
			{ directoryId: null, path: `${dirPath}/tmp2` },
			{ directoryId: null, path: `${dirPath}/tmp3` },
			{ directoryId: dirInsertId, path: `${dirPath}/1/tmp4` },
		]));

		const { createdDirs, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 1,
			fileInsertId,
			fileCount: 4,
		});

		const input = createProcessedInputFiles(fileInsertId, createdDirs, createdFiles, [
			{ directoryId: dirInsertId, name: 'tmpOne' },
			{ directoryId: null, name: 'tmpTwo' },
			{ directoryId: null, name: 'tmpThree' },
			{ directoryId: dirInsertId, name: 'tmpFour' },
		]);
		const modifiedFileIds = new Set<number>();

		await processEditedFiles(input, modifiedFileIds, `${dirPath}/`);

		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId),
			{ ...createdFiles.get(fileInsertId), directoryId: dirInsertId, name: 'tmpOne', path: `${dirPath}/1/tmpOne` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/1/tmp1`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/1/tmpOne`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 1),
			{ ...createdFiles.get(fileInsertId + 1), directoryId: null, name: 'tmpTwo', path: `${dirPath}/tmpTwo` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/tmp2`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/tmpTwo`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 2),
			{ ...createdFiles.get(fileInsertId + 2), directoryId: null, name: 'tmpThree', path: `${dirPath}/tmpThree` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/tmp3`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/tmpThree`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 3),
			{ ...createdFiles.get(fileInsertId + 3), directoryId: dirInsertId, name: 'tmpFour', path: `${dirPath}/1/tmpFour` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/1/tmp4`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/1/tmpFour`), true);
		assert.deepStrictEqual(modifiedFileIds, new Set(createdFileIds));
	});

	await t.test('moves files', async () => {
		await mkdir(`${testFilesPath}/2`);
		await mkdir(`${testFilesPath}/2/3`);
		await writeFile(`${testFilesPath}/2/3/tmp7`, '');
		await writeFile(`${testFilesPath}/tmp6`, '');
		await writeFile(`${testFilesPath}/2/tmp5`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/2` },
		]));
		await db.insert(directories).values(createDirectories([{ parentId: dirInsertId, path: `${dirPath}/2/3` }]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId + 1, path: `${dirPath}/2/3/tmp7` },
			{ directoryId: null, path: `${dirPath}/tmp6` },
			{ directoryId: dirInsertId, path: `${dirPath}/2/tmp5` },
		]));

		const { createdDirs, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 2,
			fileInsertId,
			fileCount: 3,
		});

		const input = createProcessedInputFiles(fileInsertId, createdDirs, createdFiles, [
			{ directoryId: null, name: 'tmpSeven' },
			{ directoryId: dirInsertId, name: 'tmpSix' },
			{ directoryId: dirInsertId + 1, name: 'tmpFive' },
		]);
		const modifiedFileIds = new Set<number>();

		await processEditedFiles(input, modifiedFileIds, `${dirPath}/`);

		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId),
			{ ...createdFiles.get(fileInsertId), directoryId: null, name: 'tmpSeven', path: `${dirPath}/tmpSeven` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/2/3/tmp7`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/tmpSeven`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 1),
			{ ...createdFiles.get(fileInsertId + 1), directoryId: dirInsertId, name: 'tmpSix', path: `${dirPath}/2/tmpSix` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/tmp6`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/2/tmpSix`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 2),
			{ ...createdFiles.get(fileInsertId + 2), directoryId: dirInsertId + 1, name: 'tmpFive', path: `${dirPath}/2/3/tmpFive` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/2/tmp5`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/2/3/tmpFive`), true);
		assert.deepStrictEqual(modifiedFileIds, new Set(createdFileIds));
	});

	await t.test('updates title and alt', async () => {
		await mkdir(`${testFilesPath}/4`);
		await writeFile(`${testFilesPath}/tmp8`, '');
		await writeFile(`${testFilesPath}/4/tmp9`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/4` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: null, path: `${dirPath}/tmp8` },
			{ directoryId: dirInsertId, path: `${dirPath}/4/tmp9` },
		]));

		const { createdDirs, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 1,
			fileInsertId,
			fileCount: 2,
		});

		const input = createProcessedInputFiles(fileInsertId, createdDirs, createdFiles, [
			{ directoryId: null, name: '1', title: 'one', alt: 'one' },
			{ directoryId: dirInsertId, name: '2', title: 'two', alt: 'two' },
		]);
		const modifiedFileIds = new Set<number>();

		await processEditedFiles(input, modifiedFileIds, `${dirPath}/`);

		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId),
			{ ...createdFiles.get(fileInsertId), title: 'one', alt: 'one' }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/tmp8`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 1),
			{ ...createdFiles.get(fileInsertId + 1), title: 'two', alt: 'two' }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/4/tmp9`), true);
		assert.deepStrictEqual(modifiedFileIds, new Set(createdFileIds));
	});

	await t.test('skips nonexistent old path', async () => {
		await mkdir(`${testFilesPath}/5`);
		await writeFile(`${testFilesPath}/5/tmp11`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/5` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: null, path: `${dirPath}/tmp10` },
			{ directoryId: dirInsertId, path: `${dirPath}/5/tmp11` },
		]));

		const { createdDirs, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 1,
			fileInsertId,
			fileCount: 2,
		});

		const input = createProcessedInputFiles(fileInsertId, createdDirs, createdFiles, [
			{ directoryId: dirInsertId, name: 'one', title: 'one', alt: 'one' },
			{ directoryId: null, name: 'tmpEleven', title: 'two', alt: 'two' },
		]);
		const modifiedFileIds = new Set<number>();

		await processEditedFiles(input, modifiedFileIds, `${dirPath}/`);

		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId),
			createdFiles.get(fileInsertId)
		);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 1),
			{
				id: fileInsertId + 1,
				directoryId: null,
				path: `${dirPath}/tmpEleven`,
				name: 'tmpEleven',
				title: 'two',
				alt: 'two',
			}
		);
		assert.strictEqual(existsSync(`${testFilesPath}/5/tmp11`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/tmpEleven`), true);
		assert.deepStrictEqual(modifiedFileIds, new Set([fileInsertId + 1]));
	});

	await t.test('skips nonexistent new path', async () => {
		await mkdir(`${testFilesPath}/7`);
		await writeFile(`${testFilesPath}/7/tmp12`, '');
		await writeFile(`${testFilesPath}/tmp13`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/6` },
			{ parentId: null, path: `${dirPath}/7` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: dirInsertId + 1, path: `${dirPath}/7/tmp12` },
			{ directoryId: null, path: `${dirPath}/tmp13` },
		]));

		const { createdDirs, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 2,
			fileInsertId,
			fileCount: 2,
		});

		const input = createProcessedInputFiles(fileInsertId, createdDirs, createdFiles, [
			{ directoryId: dirInsertId, name: 'tmpTwelve', title: 'one', alt: 'one' },
			{ directoryId: dirInsertId + 1, name: 'tmpThirteen', title: 'two', alt: 'two' },
		]);
		const modifiedFileIds = new Set<number>();

		await processEditedFiles(input, modifiedFileIds, `${dirPath}/`);

		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId),
			createdFiles.get(fileInsertId)
		);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 1),
			{
				id: fileInsertId + 1,
				directoryId: dirInsertId + 1,
				path: `${dirPath}/7/tmpThirteen`,
				name: 'tmpThirteen',
				title: 'two',
				alt: 'two',
			}
		);
		assert.strictEqual(existsSync(`${testFilesPath}/tmp13`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/7/tmpThirteen`), true);
		assert.deepStrictEqual(modifiedFileIds, new Set([fileInsertId + 1]));
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
		})
		.from(files)
		.where(inArray(files.id, ids));
}