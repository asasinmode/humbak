import assert from 'node:assert';
import test from 'node:test';
import { type IDir, getDirsToDelete, getDirsToEdit } from 'src/helpers/fileProcessing';

function createDir(id: number, parentId: number | null, path?: string) {
	return {
		id,
		parentId,
		name: `${id}`,
		path: path ?? `/${id}`,
	};
}

function createAllDirs(dirs: { parentId: number | null; path?: string; }[]): {
	allDirs: Map<number, IDir>;
	allDirsArray: IDir[];
} {
	const allDirs = new Map<number, IDir>();
	const allDirsArray: IDir[] = [];

	for (let i = 0; i < dirs.length; i++) {
		const id = i + 1;
		const tmp = dirs[i];
		const dir = createDir(id, tmp.parentId, tmp.path);
		allDirs.set(id, dir);
		allDirsArray.push(dir);
	}

	return { allDirs, allDirsArray };
}

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

test('dir editing error', async (t) => {
	await t.test('errors nonexistent', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);

		const result = await getDirsToEdit(allDirs, allDirsArray, new Map(), [
			{ id: 1, parentId: null, name: '1' },
			{ id: 2, parentId: null, name: '2' },
		]);

		assert.deepStrictEqual(
			result.dirsToEdit,
			[{ id: 1, parentId: null, name: '1' }]
		);
		assert.deepStrictEqual(result.errors, { 1: { id: 'folder nie istnieje' } });
	});

	await t.test('skips deleted', async () => {
		const { allDirs, allDirsArray } = createAllDirs([
			{ parentId: null },
		]);
		const deletedDirs = new Map([[1, allDirs.get(1)!]]);

		const result = await getDirsToEdit(allDirs, allDirsArray, deletedDirs, [
			{ id: 1, parentId: null, name: '1' },
		]);

		assert.deepStrictEqual(result.dirsToEdit, []);
		assert.deepStrictEqual(result.errors, {});
	});

	// 136 remove check? should move dirs then delete, so moving to dirs being deleted should be allowed
	// keep check because all deleted should already be there from walking children
	// so just skip
	// await t.test('skips deleted', async () => {
	// 	assert.equal(1, 1);
	// });

	// await t.test('skips unchanged (same name & parentId)', async () => {
	// 	assert.equal(1, 1);
	// });

	// await t.test('errors nonexistent parent id', async () => {
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
