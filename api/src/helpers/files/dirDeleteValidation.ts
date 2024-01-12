import type { IDir, IPutDirectoryInput } from '../../routes/directories.ts';

export function getDirsToDelete(
	input: IPutDirectoryInput['deletedDirIds'],
	allDirs: Map<number | null, IDir>,
	allDirsArray: IDir[]
) {
	const dirsToDelete: IDir[] = [];

	for (const id of [...new Set(input)]) {
		const dir = allDirs.get(id);
		dir && dirsToDelete.push(dir);
	}

	return recursiveDirChildren(allDirsArray, dirsToDelete);
}

export function recursiveDirChildren(
	allDirs: IDir[],
	dirsToDelete: IDir[],
	rv = new Map<number, IDir>()
): Map<number, IDir> {
	function recurse(dir: IDir) {
		rv!.set(dir.id, dir);
		const children = allDirs.filter(d => d.parentId === dir.id);
		for (const child of children) {
			recurse(child);
		}
	}

	for (const dir of dirsToDelete) {
		recurse(dir);
	}

	return rv;
}
