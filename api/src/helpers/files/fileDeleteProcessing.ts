import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { inArray } from 'drizzle-orm';
import { db } from 'src/db';
import { files } from 'src/db/schema/files';
import { filesStoragePath } from 'src/helpers/files';
import { filesToPages } from 'src/db/schema/filesToPages';

export async function processDeletedFiles(input: number[], modifiedPagesIds: Set<number>) {
	if (!input.length) {
		return;
	}

	const originalFiles = await db
		.select({
			id: files.id,
			path: files.path,
		})
		.from(files)
		.where(inArray(files.id, input));

	for (const file of originalFiles) {
		existsSync(`${filesStoragePath}${file.path}`) && await rm(`${filesStoragePath}${file.path}`);
	}

	const affectedPageIds = await db
		.selectDistinct({
			pageId: filesToPages.pageId,
		})
		.from(filesToPages)
		.where(inArray(filesToPages.fileId, input));

	for (const { pageId } of affectedPageIds) {
		modifiedPagesIds.add(pageId);
	}

	await db.delete(files).where(inArray(files.id, input));
}
