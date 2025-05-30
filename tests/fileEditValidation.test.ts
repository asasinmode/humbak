import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { getFilesToEdit } from '../layers/admin/server/utils/fileEditValidation';
import { createAllDirs, createInputFile, createOriginalFiles } from './helpers';

const dirPath = '/fileEditValidation';
const testFilesPath = `${filesStoragePath}${dirPath}`;

test('file edit validation', async (t) => {
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

	await t.test('errors nonexistent', async () => {
		const { allDirs } = createAllDirs([
			{ parentId: null },
		]);
		const originalFiles = createOriginalFiles([]);

		const result = await getFilesToEdit([
			createInputFile(1, null),
		], allDirs, [], originalFiles);

		assert.deepStrictEqual(result.filesToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				id: 'plik nie istnieje',
			},
		});
	});

	await t.test('errors 2 moved to same location', async () => {
		const originalFiles = createOriginalFiles([
			{ directoryId: null },
			{ directoryId: null },
		]);

		const result = await getFilesToEdit([
			createInputFile(1, null, '1'),
			createInputFile(2, null, '1'),
		], new Map(), [], originalFiles);

		assert.deepStrictEqual(result.filesToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				name: 'wiele plików nie może być przeniesione w to samo miejsce',
			},
			1: {
				name: 'wiele plików nie może być przeniesione w to samo miejsce',
			},
		});
	});

	await t.test('errors 3 moved to same location', async () => {
		const originalFiles = createOriginalFiles([
			{ directoryId: null },
			{ directoryId: null },
			{ directoryId: null },
		]);

		const result = await getFilesToEdit([
			createInputFile(1, null, '1'),
			createInputFile(2, null, '1'),
			createInputFile(3, null, '1'),
		], new Map(), [], originalFiles);

		assert.deepStrictEqual(result.filesToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				name: 'wiele plików nie może być przeniesione w to samo miejsce',
			},
			1: {
				name: 'wiele plików nie może być przeniesione w to samo miejsce',
			},
			2: {
				name: 'wiele plików nie może być przeniesione w to samo miejsce',
			},
		});
	});

	await t.test('errors multiple of the same', async () => {
		const originalFiles = createOriginalFiles([
			{ directoryId: null },
			{ directoryId: null },
		]);

		const result = await getFilesToEdit([
			createInputFile(1, null),
			createInputFile(1, null),
		], new Map(), [], originalFiles);

		assert.deepStrictEqual(result.filesToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				id: 'tylko jedna instrukcja może być wysłana naraz',
			},
			1: {
				id: 'tylko jedna instrukcja może być wysłana naraz',
			},
		});
	});

	await t.test('skips deleted', async () => {
		const { allDirs } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
		]);
		const originalFiles = createOriginalFiles([
			{ directoryId: null },
			{ directoryId: null },
		]);

		const result = await getFilesToEdit([
			createInputFile(1, null),
			createInputFile(2, 1, 'two'),
		], allDirs, [1], originalFiles);

		assert.deepStrictEqual(result.filesToEdit, [
			{
				id: 2,
				directoryId: 1,
				name: 'two',
				title: '2',
				alt: '2',
				targetDir: allDirs.get(1),
				originalFile: originalFiles.get(2),
			},
		]);
		assert.deepStrictEqual(result.errors, {});
	});

	await t.test('errors nonexistent directoryId', async () => {
		const { allDirs } = createAllDirs([
			{ parentId: null },
		]);
		const originalFiles = createOriginalFiles([
			{ directoryId: null },
			{ directoryId: null },
		]);

		const result = await getFilesToEdit([
			createInputFile(1, null),
			createInputFile(2, 2),
		], allDirs, [], originalFiles);

		assert.deepStrictEqual(result.filesToEdit, [
			{
				id: 1,
				directoryId: null,
				name: '1',
				title: '1',
				alt: '1',
				targetDir: undefined,
				originalFile: originalFiles.get(1),
			},
		]);
		assert.deepStrictEqual(result.errors, {
			1: {
				directoryId: 'wybrany folder nie istnieje',
			},
		});
	});

	await t.test('errors file exists in chosen location (root)', async () => {
		await writeFile(`${testFilesPath}/tmp`, '');

		const originalFiles = createOriginalFiles([
			{ directoryId: null },
			{ directoryId: null },
		]);

		const result = await getFilesToEdit([
			createInputFile(1, null, 'tmp'),
			createInputFile(2, null, 'two'),
		], new Map(), [], originalFiles, `${dirPath}/`);

		assert.deepStrictEqual(result.filesToEdit, [
			{
				id: 2,
				directoryId: null,
				name: 'two',
				title: '2',
				alt: '2',
				targetDir: undefined,
				originalFile: originalFiles.get(2),
			},
		]);
		assert.deepStrictEqual(result.errors, {
			0: {
				name: 'plik o podanej nazwie istnieje w wybranej lokacji',
			},
		});
	});

	await t.test('errors file exists in chosen location (nested)', async () => {
		await mkdir(`${testFilesPath}/1`);
		await writeFile(`${testFilesPath}/1/tmp`, '');

		const { allDirs } = createAllDirs([
			{ parentId: null, path: `${dirPath}/1` },
		]);

		const originalFiles = createOriginalFiles([
			{ directoryId: null },
			{ directoryId: null },
		]);

		const result = await getFilesToEdit([
			createInputFile(2, null, 'two'),
			createInputFile(1, 1, 'tmp'),
		], allDirs, [], originalFiles, `${dirPath}/`);

		assert.deepStrictEqual(result.filesToEdit, [
			{
				id: 2,
				directoryId: null,
				name: 'two',
				title: '2',
				alt: '2',
				targetDir: undefined,
				originalFile: originalFiles.get(2),
			},
		]);
		assert.deepStrictEqual(result.errors, {
			1: {
				name: 'plik o podanej nazwie istnieje w wybranej lokacji',
			},
		});
	});

	await t.test('errors file exists in chosen location (image)', async () => {
		await writeFile(`${testFilesPath}/tmpPng.png`, '');
		await writeFile(`${testFilesPath}/tmpJpg.jpeg`, '');
		await writeFile(`${testFilesPath}/other.txt`, '');

		const originalFiles = createOriginalFiles([
			{ directoryId: null, name: 'tmpPng.png', mimetype: 'image/png' },
			{ directoryId: null, name: 'tmpJpg.jpeg', mimetype: 'image/jpeg' },
		]);

		const result = await getFilesToEdit([
			createInputFile(1, null, 'other.png'),
			createInputFile(2, null, 'other.jpeg'),
		], new Map(), [], originalFiles, `${dirPath}/`);

		assert.deepStrictEqual(result.filesToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				name: 'plik o podanej nazwie istnieje w wybranej lokacji',
			},
			1: {
				name: 'plik o podanej nazwie istnieje w wybranej lokacji',
			},
		});
	});

	await t.test('accepts file exists in chosen location (not image)', async () => {
		await writeFile(`${testFilesPath}/tmp.txt`, '');
		await writeFile(`${testFilesPath}/tmpGif.gif`, '');
		await writeFile(`${testFilesPath}/tmpSvg.svg`, '');
		await writeFile(`${testFilesPath}/other.txt`, '');

		const originalFiles = createOriginalFiles([
			{ directoryId: null, name: 'tmp.pdf' },
			{ directoryId: null, name: 'tmpGif.gif', mimetype: 'image/gif' },
			{ directoryId: null, name: 'tmpSvg.svg', mimetype: 'image/svg+xml' },
		]);

		const result = await getFilesToEdit([
			createInputFile(1, null, 'other.pdf'),
			createInputFile(2, null, 'other.gif'),
			createInputFile(3, null, 'other.svg'),
		], new Map(), [], originalFiles, `${dirPath}/`);

		assert.deepStrictEqual(result.filesToEdit, [
			{
				id: 1,
				directoryId: null,
				name: 'other.pdf',
				title: '1',
				alt: '1',
				targetDir: undefined,
				originalFile: originalFiles.get(1),
			},
			{
				id: 2,
				directoryId: null,
				name: 'other.gif',
				title: '2',
				alt: '2',
				targetDir: undefined,
				originalFile: originalFiles.get(2),
			},
			{
				id: 3,
				directoryId: null,
				name: 'other.svg',
				title: '3',
				alt: '3',
				targetDir: undefined,
				originalFile: originalFiles.get(3),
			},
		]);
		assert.deepStrictEqual(result.errors, {});
	});

	await t.test('accepts only alt/title changed', async () => {
		await writeFile(`${testFilesPath}/tmp3`, '');

		const originalFiles = createOriginalFiles([
			{ directoryId: null, name: 'tmp3' },
		]);

		const result = await getFilesToEdit([
			{
				id: 1,
				directoryId: null,
				name: 'tmp3',
				alt: 'changed',
				title: 'changed',
			},
		], new Map(), [], originalFiles, `${dirPath}/`);

		assert.deepStrictEqual(result.filesToEdit, [
			{
				id: 1,
				directoryId: null,
				name: 'tmp3',
				alt: 'changed',
				title: 'changed',
				targetDir: undefined,
				originalFile: originalFiles.get(1),
			},
		]);
	});
});
