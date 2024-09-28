import type { IEditedFile } from './fileEditValidation';
import { existsSync } from 'node:fs';
import { eq, inArray } from 'drizzle-orm';
import { filesStoragePath } from '.';
import { db } from '../../db';
import { files } from '../../db/schema/files';
import { filesToPages } from '../../db/schema/filesToPages';
import { filesToSlides } from '../../db/schema/filesToSlides';
import { renameFile } from './image';

export async function processEditedFiles(
	input: IEditedFile[],
	modifiedPagesIds: Set<number>,
	modifiedSlidesIds: Set<number>,
	rootPath = '/'
) {
	if (!input.length) {
		return;
	}

	const modifiedFilesIds: number[] = [];
	for (const file of input) {
		const { originalFile, targetDir } = file;

		const hasMoved = originalFile.directoryId !== file.directoryId || file.name !== originalFile.name;
		let path = originalFile.path;
		if (hasMoved) {
			let targetDirPath = rootPath;
			if (file.directoryId !== null) {
				if (!targetDir) {
					throw new Error('target dir should\'ve been set by now');
				}
				targetDirPath = `${targetDir.path}/`;
			}

			const oldPath = `${filesStoragePath}${originalFile.path}`;
			const oldPathExists = existsSync(oldPath);
			const newPathExists = existsSync(`${filesStoragePath}${targetDirPath}`);
			if (!oldPathExists) {
				console.error('FILE to edit OLD path doesn\'t exist');
				continue;
			}
			if (!newPathExists) {
				console.error('FILE to edit NEW path doesn\'t exist');
				continue;
			}

			const newPath = `${filesStoragePath}${targetDirPath}/${file.name}`;
			await renameFile(oldPath, newPath, originalFile.mimetype);
			path = `${targetDirPath}${file.name}`;
		}

		modifiedFilesIds.push(originalFile.id);

		await db
			.update(files)
			.set({
				name: file.name,
				title: file.title,
				alt: file.alt,
				directoryId: file.directoryId,
				path,
				updatedAt: new Date(),
			})
			.where(eq(files.id, file.id));
	}

	if (!modifiedFilesIds.length) {
		return;
	}

	const affectedPageIds = await db
		.selectDistinct({
			pageId: filesToPages.pageId,
		})
		.from(filesToPages)
		.where(inArray(filesToPages.fileId, modifiedFilesIds));

	for (const { pageId } of affectedPageIds) {
		modifiedPagesIds.add(pageId);
	}

	const affectedSlideIds = await db
		.selectDistinct({
			slideId: filesToSlides.slideId,
		})
		.from(filesToSlides)
		.where(inArray(filesToSlides.fileId, modifiedFilesIds));

	for (const { slideId } of affectedSlideIds) {
		modifiedSlidesIds.add(slideId);
	}
}
