import assert from 'node:assert';
import test from 'node:test';
import { getDirsToDelete } from 'src/helpers/files/dirDeleteValidation';
import { createAllDirs } from './helpers';

test('dir deleting', { skip: true }, async (t) => {
	await t.test('dedupes', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		assert.deepStrictEqual(
			getDirsToDelete(allDirs, allDirsArray, [1, 1]),
			new Map([
				[1, allDirs.get(1)],
			])
		);
	});

	await t.test('ignores nonexistent dirs', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		assert.deepStrictEqual(
			getDirsToDelete(allDirs, allDirsArray, [1, 2]),
			new Map([
				[1, allDirs.get(1)],
			])
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
			getDirsToDelete(allDirs, allDirsArray, [3, 1]),
			new Map([
				[3, allDirs.get(3)],
				[1, allDirs.get(1)],
				[4, allDirs.get(4)],
				[6, allDirs.get(6)],
				[7, allDirs.get(7)],
				[8, allDirs.get(8)],
				[5, allDirs.get(5)],
			])
		);
	});
});

// test('dir editing success', async (t) => {
// 	await t.test('renamed in root', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('moved to root', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('renamed in subdir', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('moved to subdir', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('file exists in chosen location', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('different dir with same name in different dir', async (t) => {
// 		assert.equal(1, 1);
// 	});
// });

// test('file editing error', async (t) => {
// 	await t.test('error nonexistent', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	// 239 remove check? should move files then delete, so moving to dirs being deleted should be allowed
// 	await t.test('skips and moves deleted', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('error target doesn\'t exist', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('error file exists in chosen location', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('error 2 files moved to same location', async (t) => {
// 		assert.equal(1, 1);
// 	});
// });

// test('file editing success', async (t) => {
// 	await t.test('changed title', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('changed alt', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('changed name', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('changed dir', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('dir exists in chosen location', async (t) => {
// 		assert.equal(1, 1);
// 	});

// 	await t.test('other file with same name in different dir', async (t) => {
// 		assert.equal(1, 1);
// 	});
// });

// 270 && 192 error if file/dir is edited and it wasn't in original
