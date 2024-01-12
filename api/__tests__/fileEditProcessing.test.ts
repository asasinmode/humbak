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
import type { IEditedFile } from 'src/helpers/files/fileEditValidation';
import { createDirectories, createFiles, createInputFile, getCreatedFiles } from './helpers';

const dirPath = '/fileEditProcessing';
const testFilesPath = `${filesStoragePath}${dirPath}`;

test('file edit processing', { concurrency: false, only: true }, async (t) => {
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

	await t.test('edits files', async () => {
		await mkdir(`${testFilesPath}/1`);
		await writeFile(`${testFilesPath}/1/tmp`, '');
		await writeFile(`${testFilesPath}/tmp1`, '');
		await writeFile(`${testFilesPath}/tmp2`, '');
		await writeFile(`${testFilesPath}/1/tmp3`, '');

		const [{ insertId: dirInsertId }] = await db.insert(directories).values(createDirectories([
			{ parentId: null, path: `${dirPath}/1` },
		]));
		const [{ insertId: fileInsertId }] = await db.insert(files).values(createFiles([
			{ directoryId: 1, path: `${dirPath}/1/tmp1` },
			{ directoryId: null, path: `${dirPath}/tmp2` },
			{ directoryId: null, path: `${dirPath}/tmp3` },
			{ directoryId: 1, path: `${dirPath}/1/tmp4` },
		]));

		const { createdDirs, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 1,
			fileInsertId,
			fileCount: 4,
		});

		const editedFiles: IEditedFile[] = [
			{
				...createInputFile(fileInsertId, dirInsertId, 'tmpOne'),
				targetDir: createdDirs.get(dirInsertId),
				originalFile: createdFiles.get(fileInsertId)!,
			},
		];
		const modifiedFileIds = new Set<number>();

		await processEditedFiles(editedFiles);

		const filesSearchResult = await db
			.select({
				id: files.id,
				directoryId: files.directoryId,
				path: files.path,
				name: files.name,
				title: files.title,
				alt: files.alt,
			})
			.from(files)
			.where(inArray(files.id, createdFileIds));

		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId),
			{ ...createdFiles.get(fileInsertId), name: 'tmpOne', path: `${dirPath}/1/tmpOne` }
		);
		assert.deepStrictEqual(modifiedFileIds, new Set([fileInsertId]));
		assert.strictEqual(existsSync(`${testFilesPath}/1/tmp1`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/1/tmpOne`), true);
		// assert.strictEqual(existsSync(`${testFilesPath}/tmp2`), false);
		// assert.strictEqual(existsSync(`${testFilesPath}/tmp3`), false);
		// assert.strictEqual(existsSync(`${testFilesPath}/1/tmp4`), false);
	});

	await t.test('skips nonexistent old path', { todo: true }, async () => {
		assert.equal(1, 1);
	});

	await t.test('skips nonexistent new path', { todo: true }, async () => {
		assert.equal(1, 1);
	});
});
