import { existsSync } from 'node:fs';
import { inArray } from 'drizzle-orm';
import { db } from 'src/db';
import { files } from 'src/db/schema/files';
import { filesStoragePath } from 'src/helpers/files';
import type { IEditedFile } from './fileEditValidation';

export async function processEditedFiles(input: IEditedFile[]) {
	const updatedFilesIds: number[] = [];

	if (input.length) {
		const originalFiles = await db
			.select({
				id: files.id,
				directoryId: files.directoryId,
				name: files.name,
				path: files.path,
			})
			.from(files)
			.where(inArray(files.id, input.map(f => f.id)));

		for (const file of input) {
			const originalFile = originalFiles.find(f => f.id === file.id);
			if (!originalFile) {
				console.error('FILE to edit not found in db');
				continue;
			}

			if (!updatedFilesIds.includes(originalFile.id)) {
				updatedFilesIds.push(originalFile.id);
			}

			const hasMoved = originalFile.directoryId !== file.directoryId || file.name !== originalFile.name;
			let path = originalFile.path;
			if (hasMoved) {
				let targetDirPath = '/';
				if (file.directoryId !== null) {
					const targetDir = dirs.find(d => d.id === file.directoryId);
					if (!targetDir) {
						console.error('FILE to edit parent dir not found');
						continue;
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
}
