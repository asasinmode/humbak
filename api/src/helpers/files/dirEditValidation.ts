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
	const dirsToEdit: IEditedDir[] = [];
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

		dirsToEdit.push(dir);
	}

	return { dirsToEdit, errors };
}
