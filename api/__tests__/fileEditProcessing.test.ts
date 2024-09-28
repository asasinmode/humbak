import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { inArray } from 'drizzle-orm';
import { db, pool } from 'src/db';
import { directories } from 'src/db/schema/directories';
import { files } from 'src/db/schema/files';
import { filesToPages } from 'src/db/schema/filesToPages';
import { filesToSlides } from 'src/db/schema/filesToSlides';
import { pages } from 'src/db/schema/pages';
import { slides } from 'src/db/schema/slides';
import { filesStoragePath } from 'src/helpers/files';
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

		await processEditedFiles(input, new Set(), new Set(), `${dirPath}/`);

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

		await processEditedFiles(input, new Set(), new Set(), `${dirPath}/`);

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
		const [{ insertId: slideInsertId }] = await db.insert(slides).values([
			{ language: 'en', name: `${dirPath}1` },
			{ language: 'en', name: `${dirPath}2` },
		]);
		await db.insert(filesToSlides).values([
			{ slideId: slideInsertId + 1, fileId: fileInsertId },
		]);

		const { createdDirs, createdFiles, createdFileIds } = await getCreatedFiles({
			dirInsertId,
			dirCount: 1,
			fileInsertId,
			fileCount: 2,
		});

		const input = createProcessedInputFiles(fileInsertId, createdDirs, createdFiles, [
			{ directoryId: null, name: 'changed8', title: 'temp8', alt: 'temp8' },
			{ directoryId: dirInsertId, name: 'tmp9', title: 'temp9', alt: 'temp9' },
		]);
		const modifiedSlidesIds = new Set<number>();

		await processEditedFiles(input, new Set(), modifiedSlidesIds, `${dirPath}/`);

		const filesSearchResult = await getUpdatedFiles(createdFileIds);

		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId),
			{ ...createdFiles.get(fileInsertId), name: 'changed8', title: 'temp8', alt: 'temp8', path: `${dirPath}/changed8` }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/changed8`), true);
		assert.deepStrictEqual(
			filesSearchResult.find(d => d.id === fileInsertId + 1),
			{ ...createdFiles.get(fileInsertId + 1), name: 'tmp9', title: 'temp9', alt: 'temp9' }
		);
		assert.strictEqual(existsSync(`${testFilesPath}/4/tmp9`), true);
		assert.deepStrictEqual(modifiedSlidesIds, new Set([slideInsertId + 1]));
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
		const [{ insertId: pageInsertId }] = await db.insert(pages).values([
			{ language: 'en', title: `${dirPath}1`, slug: `${dirPath}1` },
			{ language: 'en', title: `${dirPath}2`, slug: `${dirPath}2` },
		]);
		await db.insert(filesToPages).values([
			{ pageId: pageInsertId, fileId: fileInsertId },
			{ pageId: pageInsertId + 1, fileId: fileInsertId + 1 },
		]);

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
		const modifiedPagesIds = new Set<number>();

		await processEditedFiles(input, modifiedPagesIds, new Set(), `${dirPath}/`);

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
				mimetype: 'text/plain',
			}
		);
		assert.strictEqual(existsSync(`${testFilesPath}/5/tmp11`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/tmpEleven`), true);
		assert.deepStrictEqual(modifiedPagesIds, new Set([pageInsertId + 1]));
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
		const [{ insertId: pageInsertId }] = await db.insert(pages).values([
			{ language: 'en', title: `${dirPath}3`, slug: `${dirPath}3` },
			{ language: 'en', title: `${dirPath}4`, slug: `${dirPath}4` },
		]);
		await db.insert(filesToPages).values([
			{ pageId: pageInsertId, fileId: fileInsertId },
			{ pageId: pageInsertId + 1, fileId: fileInsertId + 1 },
		]);

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
		const modifiedPagesIds = new Set<number>();

		await processEditedFiles(input, modifiedPagesIds, new Set(), `${dirPath}/`);

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
				mimetype: 'text/plain',
			}
		);
		assert.strictEqual(existsSync(`${testFilesPath}/tmp13`), false);
		assert.strictEqual(existsSync(`${testFilesPath}/7/tmpThirteen`), true);
		assert.deepStrictEqual(modifiedPagesIds, new Set([pageInsertId + 1]));
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
