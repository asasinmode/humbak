import type { IDir } from 'src/routes/directories';

export function createDir(id: number, parentId: number | null, path?: string) {
	return {
		id,
		parentId,
		name: `${id}`,
		path: path ?? `/${id}`,
	};
}

export function createAllDirs(dirs: { parentId: number | null; path?: string; }[]): {
	allDirs: Map<number, IDir>;
	allDirsArray: IDir[];
} {
	const allDirs = new Map<number, IDir>();
	const allDirsArray: IDir[] = [];

	for (let i = 0; i < dirs.length; i++) {
		const id = i + 1;
		const tmp = dirs[i];
		const dir = createDir(id, tmp.parentId, tmp.path);
		allDirs.set(id, dir);
		allDirsArray.push(dir);
	}

	return { allDirs, allDirsArray };
}
