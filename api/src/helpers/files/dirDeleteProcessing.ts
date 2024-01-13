import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { eq, inArray } from 'drizzle-orm';
import { db } from 'src/db';
import { filesStoragePath } from 'src/helpers/files';
import type { IDir } from 'src/routes/directories';
import { directories } from 'src/db/schema/directories';
import { filesToPages } from 'src/db/schema/filesToPages';
import { files } from 'src/db/schema/files';

export async function processDeletedDirs(
	input: Map<number, IDir>,
	allDirs: Map<number, IDir>,
	modifiedPagesIds: Set<number>
) {
	if (!input.size) {
		return;
	}

	const dirIdsToDelete: number[] = [];
	for (const [id, dir] of input.entries()) {
		dirIdsToDelete.push(id);

		const path = `${filesStoragePath}${dir.path}`;
		existsSync(path) && await rm(path, { recursive: true });
		allDirs.delete(dir.id);
	}

	const affectedPageIds = await db
		.selectDistinct({
			pageId: filesToPages.pageId,
		})
		.from(filesToPages)
		.leftJoin(files, eq(files.id, filesToPages.fileId))
		.where(inArray(files.directoryId, dirIdsToDelete));

	for (const { pageId } of affectedPageIds) {
		modifiedPagesIds.add(pageId);
	}

	await db.delete(directories).where(inArray(directories.id, dirIdsToDelete));
}
