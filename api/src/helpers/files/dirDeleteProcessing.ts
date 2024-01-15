import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../../db';
import type { IDir } from '../../routes/directories';
import { directories } from '../../db/schema/directories';
import { filesToPages } from '../../db/schema/filesToPages';
import { files } from '../../db/schema/files';
import { filesStoragePath } from '.';

export async function processDeletedDirs(
	input: Map<number, IDir>,
	allDirs: Map<number, IDir>,
	allDirsArray: IDir[],
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
		const index = allDirsArray.findIndex(d => d.id === dir.id);
		if (index !== -1) {
			allDirsArray.splice(index, 1);
		}
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
