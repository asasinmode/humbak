import assert from 'node:assert';
import test from 'node:test';
import { getDirsToEdit } from 'src/helpers/files/dirEditValidation';
import { createAllDirs } from './helpers';

test('dir edit validation', { only: true }, async (t) => {
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

	await t.test('moves to deleted and keeps edited', async () => {
		/*
		 * 1
		 * 2
		 * 3
		 */
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
			{ parentId: null },
		]);
		const deletedDirs = new Map([
			[1, allDirs.get(1)!],
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, deletedDirs, [
			{ id: 2, parentId: 1, name: '1' },
			{ id: 3, parentId: null, name: 'three' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, [
			{ id: 3, parentId: null, name: 'three' },
		]);
		assert.deepStrictEqual(deletedDirs, new Map([
			[1, allDirs.get(1)],
			[2, allDirs.get(2)],
		]));
	});

	await t.test('moves to deleted 1', async () => {
		/*	FROM		TO
		*		1				 1 (deleted)
		*		2				 | 2
		*		| 3			   | 3
		*/
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
			{ parentId: 2 },
		]);
		const deletedDirs = new Map([
			[1, allDirs.get(1)!],
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, deletedDirs, [
			{ id: 2, parentId: 1, name: '1' }, // move 2 to 1
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(deletedDirs, new Map([
			[1, allDirs.get(1)],
			[2, allDirs.get(2)],
			[3, allDirs.get(3)],
		]));
	});

	await t.test('moves to deleted 2', async () => {
		/*	FROM			TO
		*		1					 1 (deleted)
		*		2					 | 2
		*		| 3				   | 3
		*		4					     | 5
		*		| 5				       | 6
		*			| 6			 four
		*/
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
			{ parentId: 2 },
			{ parentId: null },
			{ parentId: 4 },
			{ parentId: 5 },
		]);
		const deletedDirs = new Map([
			[1, allDirs.get(1)!],
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, deletedDirs, [
			{ id: 5, parentId: 3, name: '5' },	// move 5 to 3
			{ id: 4, parentId: null, name: 'four' },	// rename 4
			{ id: 2, parentId: 1, name: '2' },	// move 2 to 1
		]);

		assert.deepStrictEqual(result.dirsToEdit, [
			{ id: 4, parentId: null, name: 'four' },
		]);
		assert.deepStrictEqual(deletedDirs, new Map([
			[1, allDirs.get(1)],
			[2, allDirs.get(2)],
			[3, allDirs.get(3)],
			[5, allDirs.get(5)],
			[6, allDirs.get(6)],
		]));
	});

	await t.test('moves to deleted 3', async () => {
		/*	FROM			TO
		*		1					 1 (deleted)
		*		2					 | 2
		*		| 3				   | 3
		*		4					     | 8
		*		5					 four
		*		6					 5 (deleted)
		*		| 7				 | 6
		*			| 8			   | 9
		*		9					     | 7
		*/
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
			{ parentId: 2 },
			{ parentId: null },
			{ parentId: null },
			{ parentId: null },
			{ parentId: 6 },
			{ parentId: 7 },
			{ parentId: null },
		]);
		const deletedDirs = new Map([
			[1, allDirs.get(1)!],
			[5, allDirs.get(5)!],
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, deletedDirs, [
			{ id: 7, parentId: 9, name: '7' },	// move 7 to 9
			{ id: 8, parentId: 3, name: '8' },	// move 8 to 3
			{ id: 4, parentId: null, name: 'four' },	// rename 4
			{ id: 9, parentId: 6, name: '9' },	// move 9 to 6
			{ id: 2, parentId: 1, name: '2' },	// move 2 to 1
			{ id: 6, parentId: 5, name: '6' },	// move 6 to 5
		]);

		assert.deepStrictEqual(result.dirsToEdit, [
			{ id: 4, parentId: null, name: 'four' },
		]);
		assert.deepStrictEqual(deletedDirs, new Map([
			[1, allDirs.get(1)],
			[2, allDirs.get(2)],
			[3, allDirs.get(3)],
			[5, allDirs.get(5)],
			[6, allDirs.get(6)],
			[7, allDirs.get(7)],
			[8, allDirs.get(8)],
			[9, allDirs.get(9)],
		]));
	});

	await t.test('moves to deleted 4', { only: true }, async () => {
		/*	FROM			TO
		*		1					 1
		*		| 5				 | 5 (deleted)
		*		4					   | 6
		*		| 2				   | 3
		*		  | 3			 four
		*		    | 6		 2
		*/
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: 4 },
			{ parentId: 2 },
			{ parentId: null },
			{ parentId: 1 },
			{ parentId: 3 },
		]);
		const deletedDirs = new Map([
			[5, allDirs.get(5)!],
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, deletedDirs, [
			{ id: 2, parentId: null, name: '2' }, // move 2 to root
			{ id: 6, parentId: 5, name: '2' }, // move 6 to 5
			{ id: 4, parentId: null, name: 'four' }, // rename 4
			{ id: 3, parentId: 5, name: '3' }, // move 3 to 5
		]);

		assert.deepStrictEqual(result.dirsToEdit, [
			{ id: 2, parentId: null, name: '2' },
			{ id: 4, parentId: null, name: 'four' },
		]);
		assert.deepStrictEqual(deletedDirs, new Map([
			[3, allDirs.get(3)],
			[5, allDirs.get(5)],
			[6, allDirs.get(6)],
		]));
	});

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
