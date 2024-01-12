import assert from 'node:assert';
import test from 'node:test';
import { getFilesToEdit } from 'src/helpers/files/fileEditValidation';
import { createInputFile, createOriginalFiles } from './helpers';

test('file edit validation', { only: true }, async (t) => {
	await t.test('errors nonexistent', async () => {
		const originalFiles = createOriginalFiles([]);

		const result = await getFilesToEdit(new Map(), new Map(), [], originalFiles, [
			createInputFile(1, null),
		]);

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

		const result = await getFilesToEdit(new Map(), new Map(), [], originalFiles, [
			createInputFile(1, null, '1'),
			createInputFile(2, null, '1'),
		]);

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

		const result = await getFilesToEdit(new Map(), new Map(), [], originalFiles, [
			createInputFile(1, null, '1'),
			createInputFile(2, null, '1'),
			createInputFile(3, null, '1'),
		]);

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

		const result = await getFilesToEdit(new Map(), new Map(), [], originalFiles, [
			createInputFile(1, null),
			createInputFile(1, null),
		]);

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
		const originalFiles = createOriginalFiles([
			{ directoryId: null },
			{ directoryId: null },
		]);

		const result = await getFilesToEdit(new Map(), new Map(), [1], originalFiles, [
			createInputFile(1, null),
			createInputFile(2, 1, 'two'),
		]);

		assert.deepStrictEqual(result.filesToEdit, [
			{ id: 2, directoryId: 1, name: 'two', title: '2', alt: '2' },
		]);
		assert.deepStrictEqual(result.errors, {});
	});

	await t.test('errors nonexistent directoryId', { todo: true }, async () => {

	});

	await t.test('errors file exists in chosen location (root)', { todo: true }, async () => {

	});

	await t.test('errors file exists in chosen location (nested)', { todo: true }, async () => {

	});
});
