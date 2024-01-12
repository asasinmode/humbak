import { existsSync } from 'node:fs';
import { rename } from 'node:fs/promises';
import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { files } from 'src/db/schema/files';
import { filesStoragePath } from 'src/helpers/files';
import type { IEditedFile } from './fileEditValidation';

export async function processEditedFiles(input: IEditedFile[], modifiedFilesIds: Set<number>) {
	if (!input.length) {
		return;
	}

	for (const file of input) {
		const { originalFile, targetDir } = file;
		modifiedFilesIds.add(originalFile.id);

		const hasMoved = originalFile.directoryId !== file.directoryId || file.name !== originalFile.name;
		let path = originalFile.path;
		if (hasMoved) {
			let targetDirPath = '/';
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
			await rename(oldPath, newPath);
			path = `${targetDirPath}${file.name}`;
		}

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
}
