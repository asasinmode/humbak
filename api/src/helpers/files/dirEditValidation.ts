import type { IDir, IPutDirectoryInput } from 'src/routes/directories';
import { recursiveDirChildren } from './dirDeleteValidation';

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

	const dirsToEdit = extractDeletedFromMoved(allDirs, allDirsArray, deletedDirs, validEditedDirs);

	return { dirsToEdit, errors };
}

function extractDeletedFromMoved(
	allDirs: Map<number, IDir>,
	allDirsArray: IDir[],
	deletedDirs: Map<number, IDir>,
	editedDirs: IPutDirectoryInput['editedDirs']
) {
	const dirsMovedToRoot: IPutDirectoryInput['editedDirs'] = [];
	let dirsMovedToOtherDirs: IPutDirectoryInput['editedDirs'] = [];
	for (const dir of editedDirs) {
		if (dir.parentId === null) {
			dirsMovedToRoot.push(dir);
		} else {
			dirsMovedToOtherDirs.push(dir);
		}
	}

	while (true) {
		let deletedDirId: number | undefined;
		for (const dir of dirsMovedToOtherDirs) {
			const isMovedToDeleted = deletedDirs.has(dir.parentId!);
			if (isMovedToDeleted) {
				deletedDirId = dir.id;
				break;
			}
		}

		if (deletedDirId === undefined) {
			break;
		}

		const deletedDir = allDirs.get(deletedDirId);
		if (!deletedDir) {
			throw new Error('original deleted dir doesn\'t exist in all dirs');
		}

		const deletedChildren = recursiveDirChildren(allDirsArray, [deletedDir]);
		for (const [id, dir] of deletedChildren.entries()) {
			deletedDirs.set(id, dir);
		}

		dirsMovedToOtherDirs = dirsMovedToOtherDirs.filter(dir => !deletedDirs.has(dir.id));
	}

	return dirsMovedToRoot.concat(dirsMovedToOtherDirs);
}
