import type { IDir, IPutDirectoryInput } from 'src/routes/directories';
import { recursiveDirChildren } from './dirDeleteValidation';

export type IEditedDir = IPutDirectoryInput['editedDirs'][number] & { originalIndex: number; };

export async function getDirsToEdit(
	allDirs: Map<number | null, IDir>,
	allDirsArray: IDir[],
	deletedDirs: Map<number, IDir>,
	input: IPutDirectoryInput['editedDirs']
): Promise<{
	dirsToEdit: IEditedDir[];
	errors: Record<number, Record<string, string>>;
}> {
	const firstPassDirs: IEditedDir[] = [];

	const errors: Record<number, Record<string, string>> = {};
	function setError(index: number, key: keyof IEditedDir, value: string) {
		errors[index] ||= {};
		errors[index][key] = value;
	};

	for (let i = 0; i < input.length; i++) {
		const dir = input[i];
		const originalDir = allDirs.get(dir.id);
		if (!originalDir) {
			setError(i, 'id', 'folder nie istnieje');
			continue;
		}

		const count = input.reduce((p, c) => {
			if (c.id === dir.id) {
				return p + 1;
			}
			return p;
		}, 0);
		if (count > 1) {
			setError(i, 'id', 'tylko jedna instrukcja może być wysłana naraz');
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
			setError(i, 'parentId', 'wybrany rodzic nie istnieje');
			continue;
		}

		firstPassDirs.push({ ...dir, originalIndex: i });
	}

	const secondPassDirs = extractDeletedFromMoved(allDirs, allDirsArray, deletedDirs, firstPassDirs);

	const dirsToEdit: IEditedDir[] = [];
	// eslint-disable-next-line no-restricted-syntax, no-labels
	outerLoop: for (const dir of secondPassDirs) {
		if (dir.id === dir.parentId) {
			setError(dir.originalIndex, 'parentId', 'folder nie może być przeniesiony do samego siebie');
			continue;
		}

		let parent = allDirs.get(dir.parentId);
		while (parent) {
			if (parent.id === dir.id) {
				setError(dir.originalIndex, 'parentId', 'folder nie może być przeniesiony do swojego podfolderu');
				// eslint-disable-next-line no-labels
				continue outerLoop;
			}
			parent = allDirs.get(parent.parentId);
		}

		dirsToEdit.push(dir);
	}

	return { dirsToEdit, errors };
}

function extractDeletedFromMoved(
	allDirs: Map<number | null, IDir>,
	allDirsArray: IDir[],
	deletedDirs: Map<number, IDir>,
	editedDirs: IEditedDir[]
) {
	const dirsMovedToRoot: IEditedDir[] = [];
	let dirsMovedToOtherDirs: IEditedDir[] = [];
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

		recursiveDirChildren(allDirsArray, [deletedDir], deletedDirs);
		dirsMovedToOtherDirs = dirsMovedToOtherDirs.filter(dir => !deletedDirs.has(dir.id));
	}

	return dirsMovedToRoot.concat(dirsMovedToOtherDirs);
}
