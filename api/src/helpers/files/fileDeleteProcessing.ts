import { inArray } from 'drizzle-orm';
import { db } from '../../db';
import { files } from '../../db/schema/files';
import { filesToPages } from '../../db/schema/filesToPages';
import { deleteFile } from './image';
import { filesStoragePath } from '.';

export async function processDeletedFiles(input: number[], modifiedPagesIds: Set<number>) {
	if (!input.length) {
		return;
	}

	const originalFiles = await db
		.select({
			id: files.id,
			path: files.path,
			mimetype: files.mimetype,
		})
		.from(files)
		.where(inArray(files.id, input));

	for (const file of originalFiles) {
		await deleteFile(`${filesStoragePath}${file.path}`, file.mimetype);
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
