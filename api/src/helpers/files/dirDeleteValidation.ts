import type { IDir, IPutDirectoryInput } from '../../routes/directories.ts';

export function getDirsToDelete(
	allDirs: Map<number, IDir>,
	allDirsArray: IDir[],
	input: IPutDirectoryInput['deletedDirIds']
) {
	const dirsToDelete: IDir[] = [];

	for (const id of [...new Set(input)]) {
		const dir = allDirs.get(id);
		dir && dirsToDelete.push(dir);
	}

	return recursiveDirChildren(allDirsArray, dirsToDelete);
}

export function recursiveDirChildren(allDirs: IDir[], dirsToDelete: IDir[]): Map<number, IDir> {
	const rv = new Map(dirsToDelete.map(d => [d.id, d]));

	function recurse(parentId: number) {
		const children = allDirs.filter(d => d.parentId === parentId);
		for (const child of children) {
			rv.set(child.id, child);
			recurse(child.id);
		}
	}

	for (const dir of dirsToDelete) {
		recurse(dir.id);
	}

	return rv;
}
