import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { lstat, mkdir, rm } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import { getDirsToEdit } from 'src/helpers/files/dirEditValidation';
import { adminFilesPath } from 'src/helpers/files';
import { createAllDirs } from './helpers';

const dirPath = '/__tests__/dirEditValidation';
const testFilesPath = `${adminFilesPath}${dirPath}`;

test('dir edit validation', async (t) => {
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
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: null, name: 'one' },
			{ id: 2, parentId: null, name: 'two' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, [
			{ id: 1, parentId: null, name: 'one', originalIndex: 0 },
		]);
		assert.deepStrictEqual(result.errors, { 1: { id: 'folder nie istnieje' } });
	});

	await t.test('errors 2 moved to same location', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: null, name: 'changed' },
			{ id: 2, parentId: null, name: 'changed' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				name: 'dwa foldery nie mogą mieć tej samej nazwy',
			},
			1: {
				name: 'dwa foldery nie mogą mieć tej samej nazwy',
			},
		});
	});

	await t.test('errors 3 moved to same location', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: null, name: 'changed' },
			{ id: 2, parentId: null, name: 'changed' },
			{ id: 3, parentId: null, name: 'changed' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				name: 'dwa foldery nie mogą mieć tej samej nazwy',
			},
			1: {
				name: 'dwa foldery nie mogą mieć tej samej nazwy',
			},
			2: {
				name: 'dwa foldery nie mogą mieć tej samej nazwy',
			},
		});
	});

	await t.test('errors multiple of same', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
			{ parentId: null },
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 3, parentId: null, name: 'three' },
			{ id: 4, parentId: null, name: 'four' },
			{ id: 2, parentId: null, name: 'two' },
			{ id: 1, parentId: null, name: 'one' },
			{ id: 4, parentId: null, name: 'four' },
			{ id: 2, parentId: null, name: 'two' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, [
			{ id: 3, parentId: null, name: 'three', originalIndex: 0 },
			{ id: 1, parentId: null, name: 'one', originalIndex: 3 },
		]);
		assert.deepStrictEqual(result.errors, {
			1: { id: 'tylko jedna instrukcja może być wysłana naraz' },
			2: { id: 'tylko jedna instrukcja może być wysłana naraz' },
			4: { id: 'tylko jedna instrukcja może być wysłana naraz' },
			5: { id: 'tylko jedna instrukcja może być wysłana naraz' },
		});
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
			{ id: 3, parentId: null, name: 'three', originalIndex: 1 },
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
			{ id: 4, parentId: null, name: 'four', originalIndex: 1 },
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
			{ id: 4, parentId: null, name: 'four', originalIndex: 2 },
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

	await t.test('moves to deleted 4', async () => {
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
			{ id: 2, parentId: null, name: '2', originalIndex: 0 },
			{ id: 4, parentId: null, name: 'four', originalIndex: 2 },
		]);
		assert.deepStrictEqual(deletedDirs, new Map([
			[3, allDirs.get(3)],
			[5, allDirs.get(5)],
			[6, allDirs.get(6)],
		]));
	});

	await t.test('errors moved to itself', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: 1, name: '1' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				parentId: 'folder nie może być przeniesiony do samego siebie',
			},
		});
	});

	await t.test('errors moved to its child 1', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: 1 },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: 2, name: '1' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				parentId: 'folder nie może być przeniesiony do swojego podfolderu',
			},
		});
	});

	await t.test('errors moved to its child 2', async () => {
		/*	FROM			TO
		*		1					 1
		*		| 5				 | 5
		*		4					   | 3
		*		| 2				     | 4
		*		  | 3			 6
		*		    | 6		 | 2
		*/
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: 4 },
			{ parentId: 2 },
			{ parentId: null },
			{ parentId: 1 },
			{ parentId: 3 },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 6, parentId: null, name: '6' },	// move 6 to root
			{ id: 3, parentId: 5, name: '3' },	// move 3 to 5
			{ id: 2, parentId: 6, name: '2' },	// move 2 to 6
			{ id: 4, parentId: 3, name: '4' },	// move 4 to 3
		]);

		assert.deepStrictEqual(result.dirsToEdit, [
			{ id: 6, parentId: null, name: '6', originalIndex: 0 },
			{ id: 3, parentId: 5, name: '3', originalIndex: 1 },
		]);
		assert.deepStrictEqual(result.errors, {
			2: {
				parentId: 'folder nie może być przeniesiony do swojego podfolderu',
			},
			3: {
				parentId: 'folder nie może być przeniesiony do swojego podfolderu',
			},
		});
	});

	await t.test('errors dir exists in chosen location (root)', async () => {
		await mkdir(`${testFilesPath}/one`);
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null, path: `${dirPath}/one` },
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 2, parentId: null, name: 'one' },
		], `${dirPath}/`);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {
			0: {
				name: 'folder o podanej nazwie istnieje w wybranej lokacji',
			},
		});
	});

	await t.test('errors dir exists in chosen location (nested)', async () => {
		await mkdir(`${testFilesPath}/1`);
		await mkdir(`${testFilesPath}/1/2`);
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null, path: `${dirPath}/1` },
			{ parentId: 1 },
			{ parentId: 1 },
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 4, parentId: null, name: 'four' },
			{ id: 3, parentId: 1, name: '2' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, [
			{ id: 4, parentId: null, name: 'four', originalIndex: 0 },
		]);
		assert.deepStrictEqual(result.errors, {
			1: {
				name: 'folder o podanej nazwie istnieje w wybranej lokacji',
			},
		});
	});
});
