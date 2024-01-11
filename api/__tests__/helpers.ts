import type { IDir, IPutDirectoryInput } from 'src/routes/directories';
import type { IOriginalFile } from 'src/helpers/files/fileEditValidation';

export function createAllDirs(dirs: { parentId: number | null; path?: string; }[]) {
	const allDirs = new Map<number, IDir>();
	const allDirsArray: IDir[] = [];

	for (let i = 0; i < dirs.length; i++) {
		const id = i + 1;
		const tmp = dirs[i];
		const dir = {
			id,
			parentId: tmp.parentId,
			name: `${id}`,
			path: tmp.path ?? `/${id}`,
		};

		allDirs.set(id, dir);
		allDirsArray.push(dir);
	}

	return { allDirs, allDirsArray };
}

export function createOriginalFiles(files: { directoryId: number | null; name?: string; }[]) {
	const rv = new Map<number, IOriginalFile>();

	for (let i = 0; i < files.length; i++) {
		const id = i + 1;
		const tmp = files[i];
		const file = {
			id,
			directoryId: tmp.directoryId,
			name: tmp.name ?? `${id}`,
		};
		rv.set(id, file);
	}

	return rv;
}

export function createInputFile(
	id: number,
	directoryId: number | null,
	name?: string
): IPutDirectoryInput['editedFiles'][number] {
	return {
		id,
		directoryId,
		name: name ?? `${id}`,
		title: `${id}`,
		alt: `${id}`,
	};
}
