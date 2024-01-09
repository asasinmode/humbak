import type { InferSelectModel } from 'drizzle-orm';
import type { IPutDirectoryInput } from '../routes/directories.ts';
import type { directories } from '../db/schema/directories';

export type IDir = Pick<InferSelectModel<typeof directories>, 'id' | 'name' | 'parentId' | 'path'>;
export type IAllDirs = Map<number, IDir>;

export function getDirsToDelete(allDirs: IAllDirs, allDirsArray: IDir[], input: IPutDirectoryInput['deletedDirIds']) {
	const dirsToDelete: IDir[] = [];

	for (const id of [...new Set(input)]) {
		const dir = allDirs.get(id);
		dir && dirsToDelete.push(dir);
	}

	return recursiveDirChildren(allDirsArray, dirsToDelete);
}

function recursiveDirChildren(allDirs: IDir[], dirsToDelete: IDir[]) {
	const acc = new Set(dirsToDelete);

	function recurse(parentId: number) {
		const children = allDirs.filter(d => d.parentId === parentId);
		for (const child of children) {
			acc.add(child);
			recurse(child.id);
		}
	}

	for (const dir of dirsToDelete) {
		recurse(dir.id);
	}

	return acc;
}
