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

	await t.test('errors multiple of the same', async () => {
		const originalFiles = createOriginalFiles([]);

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
});
