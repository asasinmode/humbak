import type { InferSelectModel } from 'drizzle-orm';
import type { IPutDirectoryInput } from '../routes/directories.ts';
import type { directories } from '../db/schema/directories';

export type IDir = Pick<InferSelectModel<typeof directories>, 'id' | 'name' | 'parentId' | 'path'>;

export function getDirsToDelete(allDirs: Map<number, IDir>, allDirsArray: IDir[], input: IPutDirectoryInput['deletedDirIds']) {
	const dirsToDelete: IDir[] = [];

	for (const id of [...new Set(input)]) {
		const dir = allDirs.get(id);
		dir && dirsToDelete.push(dir);
	}

	return recursiveDirChildren(allDirsArray, dirsToDelete);
}

function recursiveDirChildren(allDirs: IDir[], dirsToDelete: IDir[]): Map<number, IDir> {
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

	// eslint-disable-next-line no-restricted-syntax, no-labels
	outerDirLoop: for (let i = 0; i < input.length; i++) {
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

		dirsToEdit.push(dir);
	}

	return { dirsToEdit, errors };
}
