import { inArray } from 'drizzle-orm';
import { db } from 'src/db';
import { files } from 'src/db/schema/files';
import { filesStoragePath } from 'src/helpers/files';
import { filesToPages } from 'src/db/schema/filesToPages';
import { deleteFile } from 'src/helpers/files/image';

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
