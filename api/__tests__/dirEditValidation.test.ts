import assert from 'node:assert';
import test from 'node:test';
import { getDirsToEdit } from 'src/helpers/files/dirEditValidation';
import { createAllDirs } from './helpers';

test('dir edit validation', async (t) => {
	await t.test('errors nonexistent', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: null, name: 'one' },
			{ id: 2, parentId: null, name: 'two' },
		]);

		assert.deepStrictEqual(
			result.dirsToEdit,
			[{ id: 1, parentId: null, name: 'one' }]
		);
		assert.deepStrictEqual(result.errors, { 1: { id: 'folder nie istnieje' } });
	});

	await t.test('skips deleted', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);
		const deletedDirs = new Map([[1, allDirs.get(1)!]]);

		const result = await getDirsToEdit(allDirs, allDirsArray, deletedDirs, [
			{ id: 1, parentId: null, name: 'one' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {});
	});

	await t.test('skips unchanged (same name & parentId)', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: null, name: '1' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {});
	});

	await t.test('errors nonexistent parent id', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: 2, name: '1' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				parentId: 'wybrany rodzic nie istnieje',
			},
		});
	});
	// 136 remove check? should move dirs then delete, so moving to dirs being deleted should be allowed
	// keep check because all deleted should already be there from walking children
	// so just skip
	// await t.test('skips deleted', async () => {
	// 	assert.equal(1, 1);
	// });

	// await t.test('errors moved to itself', async () => {
	// 	assert.equal(1, 1);
	// });

	// await t.test('errors moved to its child', async () => {
	// 	assert.equal(1, 1);
	// });

	// await t.test('errors dir exists in chosen location', async () => {
	// 	assert.equal(1, 1);
	// });

	// await t.test('errors 2 dirs moved to same location', async () => {
	// 	assert.equal(1, 1);
	// });
});
