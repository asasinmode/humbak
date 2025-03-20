import { inArray } from 'drizzle-orm';
import { deleteFile } from '~~/server/utils/image';

const { files, filesToPages, filesToSlides } = tables;

export async function processDeletedFiles(input: number[], modifiedPagesIds: Set<number>, modifiedSlidesIds: Set<number>) {
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

	const affectedSlideIds = await db
		.selectDistinct({
			slideId: filesToSlides.slideId,
		})
		.from(filesToSlides)
		.where(inArray(filesToSlides.fileId, input));

	for (const { slideId } of affectedSlideIds) {
		modifiedSlidesIds.add(slideId);
	}

	await db.delete(files).where(inArray(files.id, input));
}
