import assert from 'node:assert';
import test from 'node:test';

test('dir deleting', async (t) => {
	await t.test('ignores nonexistent dirs', async (t) => {
		assert.equal(1, 1);
	});

	// 117 line decide if pass all dirs being deleted or just the ones input
	await t.test('returns child dirs', async (t) => {
		assert.equal(1, 1);
	});
});

test('dir editing error', async (t) => {
	await t.test('errors nonexistent', async (t) => {
		assert.equal(1, 1);
	});

	// 136 remove check? should move dirs then delete, so moving to dirs being deleted should be allowed
	// keep check because all deleted should already be there from walking children
	// so just skip
	await t.test('skips deleted', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('skips unchanged (same name & parentId)', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('errors nonexistent parent id', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('errors moved to itself', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('errors moved to its child', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('errors dir exists in chosen location', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('errors 2 dirs moved to same location', async (t) => {
		assert.equal(1, 1);
	});
});

test('dir editing success', async (t) => {
	await t.test('renamed in root', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('moved to root', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('renamed in subdir', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('moved to subdir', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('file exists in chosen location', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('different dir with same name in different dir', async (t) => {
		assert.equal(1, 1);
	});
});

test('file editing error', async (t) => {
	await t.test('error nonexistent', async (t) => {
		assert.equal(1, 1);
	});

	// 239 remove check? should move files then delete, so moving to dirs being deleted should be allowed
	await t.test('skips and moves deleted', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('error target doesn\'t exist', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('error file exists in chosen location', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('error 2 files moved to same location', async (t) => {
		assert.equal(1, 1);
	});
});

test('file editing success', async (t) => {
	await t.test('changed title', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('changed alt', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('changed name', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('changed dir', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('dir exists in chosen location', async (t) => {
		assert.equal(1, 1);
	});

	await t.test('other file with same name in different dir', async (t) => {
		assert.equal(1, 1);
	});
});

// ^^^ VALIDATION TEST FILE
// 270 && 192 error if file/dir is edited and it wasn't in original
