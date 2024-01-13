import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { inArray } from 'drizzle-orm';
import { db } from 'src/db';
import { filesStoragePath } from 'src/helpers/files';
import type { IDir } from 'src/routes/directories';
import { directories } from 'src/db/schema/directories';

export async function processDeletedDirs(
	input: Map<number, IDir>,
	allDirs: Map<number, IDir>,
	modifiedDirsIds: Set<number>
) {
	if (!input.size) {
		return;
	}

	const dirIdsToDelete: number[] = [];
	for (const [id, dir] of input.entries()) {
		dirIdsToDelete.push(id);
		modifiedDirsIds.add(id);

		const path = `${filesStoragePath}${dir.path}`;
		existsSync(path) && await rm(path, { recursive: true });
		allDirs.delete(dir.id);
	}

	await db.delete(directories).where(inArray(directories.id, dirIdsToDelete));
}
