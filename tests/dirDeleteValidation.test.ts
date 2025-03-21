import assert from 'node:assert';
import test from 'node:test';
import { getDirsToDelete } from '../layers/admin/server/utils/dirDeleteValidation';
import { createAllDirs } from './helpers';

test('dir delete validation', async (t) => {
	await t.test('dedupes', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		assert.deepStrictEqual(
			getDirsToDelete([1, 1], allDirs, allDirsArray),
			new Map([
				[1, allDirs.get(1)],
			]),
		);
	});

	await t.test('ignores nonexistent dirs', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		assert.deepStrictEqual(
			getDirsToDelete([1, 2], allDirs, allDirsArray),
			new Map([
				[1, allDirs.get(1)],
			]),
		);
	});

	await t.test('returns child dirs', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
			{ parentId: null },
			{ parentId: 1 },
			{ parentId: 3 },
			{ parentId: 3 },
			{ parentId: 4 },
			{ parentId: 6 },
			{ parentId: 6 },
		]);

		assert.deepStrictEqual(
			getDirsToDelete([3, 1], allDirs, allDirsArray),
			new Map([
				[3, allDirs.get(3)],
				[1, allDirs.get(1)],
				[4, allDirs.get(4)],
				[6, allDirs.get(6)],
				[7, allDirs.get(7)],
				[8, allDirs.get(8)],
				[5, allDirs.get(5)],
			]),
		);
	});
});
