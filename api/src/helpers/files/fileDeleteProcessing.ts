import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { inArray } from 'drizzle-orm';
import { db } from 'src/db';
import { files } from 'src/db/schema/files';
import { filesStoragePath } from 'src/helpers/files';

export async function processDeletedFiles(
	deletedFilesIds: number[],
	modifiedFilesIds: Set<number>
) {
	if (!deletedFilesIds.length) {
		return;
	}

	const originalFiles = await db
		.select({
			id: files.id,
			path: files.path,
		})
		.from(files)
		.where(inArray(files.id, deletedFilesIds));

	for (const file of originalFiles) {
		modifiedFilesIds.add(file.id);
		existsSync(`${filesStoragePath}${file.path}`) && await rm(`${filesStoragePath}${file.path}`);
	}

	await db.delete(files).where(inArray(files.id, deletedFilesIds));
}
