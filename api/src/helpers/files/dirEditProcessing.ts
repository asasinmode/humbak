import { existsSync } from 'node:fs';
import { rename } from 'node:fs/promises';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from 'src/db';
import type { IDir } from 'src/routes/directories';
import { directories } from 'src/db/schema/directories';
import { filesStoragePath } from 'src/helpers/files';
import { files } from 'src/db/schema/files';
import { filesToPages } from 'src/db/schema/filesToPages';
import type { IEditedDir } from './dirEditValidation';

export async function processEditedDirs(
	input: IEditedDir[],
	allDirs: Map<number, IDir>,
	allDirsArray: IDir[],
	modifiedPagesIds: Set<number>,
	rootPath = '/'
) {
	if (!input.length) {
		return;
	}

	const updatedDirIds = new Set<number>();

	while (input.length) {
		const dirsToGoThrough: IEditedDir[] = [];

		for (let i = 0; i < input.length; i++) {
			const { parentId } = input[i];
			const parentIds: number[] = [];
			let parent = allDirs.get(parentId!);
			while (parent) {
				parentIds.push(parent.id);
				parent = allDirs.get(parent.parentId!);
			}

			const isParentBeingEdited = parentIds.some(id =>
				dirsToGoThrough.some(dir => dir.id === id) || input.some(dir => dir.id === id)
			);
			if (!isParentBeingEdited) {
				const [dir] = input.splice(i, 1);
				dirsToGoThrough.push(dir);
				i--;
			}
		}

		for (const dir of dirsToGoThrough) {
			await updateDir(allDirs, allDirsArray, dir, updatedDirIds, rootPath);
		}
	}

	if (!updatedDirIds.size) {
		return;
	}

	const affectedPageIds = await db
		.selectDistinct({
			pageId: filesToPages.pageId,
		})
		.from(filesToPages)
		.leftJoin(files, eq(files.id, filesToPages.fileId))
		.where(inArray(files.directoryId, Array.from(updatedDirIds)));

	for (const { pageId } of affectedPageIds) {
		modifiedPagesIds.add(pageId);
	}
}

async function updateDir(
	allDirs: Map<number, IDir>,
	allDirsArray: IDir[],
	dir: IEditedDir,
	updatedDirIds: Set<number>,
	rootPath: string
) {
	const originalDirIndex = allDirsArray.findIndex(d => d.id === dir.id);
	if (originalDirIndex === -1 || !allDirs.has(dir.id)) {
		console.error('DIR to edit not found');
		return;
	}
	const originalDir = allDirsArray[originalDirIndex];

	let targetDirPath = rootPath;
	if (dir.parentId !== null) {
		const targetDir = allDirs.get(dir.parentId);
		if (!targetDir) {
			console.error('DIR to edit parent dir not found');
			return;
		}
		targetDirPath = `${targetDir.path}/`;
	}

	const oldPath = `${filesStoragePath}${originalDir.path}`;
	const oldPathExists = existsSync(oldPath);
	const newPathExists = existsSync(`${filesStoragePath}${targetDirPath}`);
	if (!oldPathExists) {
		console.error('DIR to edit OLD path doesn\'t exist');
		return;
	}
	if (!newPathExists) {
		console.error('DIR to edit NEW path doesn\'t exist');
		return;
	}

	const path = `${targetDirPath}${dir.name}`;
	const newPath = `${filesStoragePath}${path}`;
	await rename(oldPath, newPath);

	await db
		.update(directories)
		.set({
			name: dir.name,
			parentId: dir.parentId,
			path,
			updatedAt: new Date(),
		})
		.where(eq(directories.id, dir.id));
	await db.execute(sql`UPDATE files
JOIN directories ON files.directoryId = directories.id
SET files.path = CONCAT(directories.path, '/', files.name)
WHERE directories.id = ${dir.id}`);

	const updatedDir = {
		path,
		id: dir.id,
		parentId: dir.parentId,
		name: dir.name,
	};
	allDirsArray[originalDirIndex] = updatedDir;
	allDirs.set(dir.id, updatedDir);

	await updateDirAssociations(allDirs, allDirsArray, allDirsArray[originalDirIndex], updatedDirIds);
}

async function updateDirAssociations(
	allDirs: Map<number, IDir>,
	allDirsArray: IDir[],
	dir: IDir,
	changedIds: Set<number>
) {
	changedIds.add(dir.id);

	const children: IDir[] = [];
	for (let i = 0; i < allDirsArray.length; i++) {
		const originalChildDir = allDirsArray[i];
		const allDirsOriginalChild = allDirs.get(originalChildDir.id);
		if (!allDirsOriginalChild) {
			continue;
		}

		if (originalChildDir.parentId === dir.id) {
			const path = `${dir.path}/${originalChildDir.name}`;
			allDirsArray[i].path = path;
			allDirsOriginalChild.path = path;
			children.push(allDirsArray[i]);
		}
	}

	await db.execute(sql`UPDATE directories
JOIN directories as parentDirectories ON directories.parentId = parentDirectories.id
SET directories.path = CONCAT(parentDirectories.path, '/', directories.name)
WHERE directories.parentId = ${dir.id};`);
	await db.execute(sql`UPDATE files
JOIN directories ON files.directoryId = directories.id
SET files.path = CONCAT(directories.path, '/', files.name)
WHERE directories.id = ${dir.id}`);

	for (const child of children) {
		await updateDirAssociations(allDirs, allDirsArray, child, changedIds);
	}
}
