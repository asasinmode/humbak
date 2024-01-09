import type { IDir, IPutDirectoryInput } from 'src/routes/directories';

export type IEditedDir = IPutDirectoryInput['editedDirs'][number];

export async function getDirsToEdit(
	allDirs: Map<number, IDir>,
	allDirsArray: IDir[],
	deletedDirs: Map<number, IDir>,
	input: IPutDirectoryInput['editedDirs']
): Promise<{
	dirsToEdit: IEditedDir[];
	errors: Record<number, Record<string, string>>;
}> {
	const validEditedDirs: IEditedDir[] = [];

	const errors: Record<number, Record<string, string>> = {};
	function setEditedDirsError(index: number, key: keyof IEditedDir, value: string) {
		errors[index] ||= {};
		errors[index][key] = value;
	};

	for (let i = 0; i < input.length; i++) {
		const dir = input[i];
		const originalDir = allDirs.get(dir.id);
		if (!originalDir) {
			setEditedDirsError(i, 'id', 'folder nie istnieje');
			continue;
		}

		const isDeleted = deletedDirs.has(dir.id);
		if (isDeleted) {
			continue;
		}

		const hasChanged = dir.parentId !== originalDir.parentId || dir.name !== originalDir.name;
		if (!hasChanged) {
			continue;
		}

		const parentExists = dir.parentId === null || allDirs.has(dir.parentId);
		if (!parentExists) {
			setEditedDirsError(i, 'parentId', 'wybrany rodzic nie istnieje');
			continue;
		}

		validEditedDirs.push(dir);
	}

	const dirsAndDepths: { dir: IEditedDir; depth: number; }[] = [];
	for (const dir of validEditedDirs) {
		let depth = 0;
		if (dir.parentId === null) {
			dirsAndDepths.push({ dir, depth });
			continue;
		}

		let parent = allDirsArray.find(d => d.id === dir.parentId);
		while (parent) {
			depth += 1;
			parent = allDirsArray.find(d => d.id === parent!.parentId);
		}
		dirsAndDepths.push({ dir, depth });
	}

	console.log('dirs and depths', dirsAndDepths);

	return { dirsToEdit: validEditedDirs, errors };
}
