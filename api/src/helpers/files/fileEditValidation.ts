import { existsSync } from 'node:fs';
import { lstat } from 'node:fs/promises';
import { filesStoragePath } from 'src/helpers/files';
import type { InferSelectModel } from 'drizzle-orm';
import type { files } from 'src/db/schema/files';
import type { IDir, IPutDirectoryInput } from 'src/routes/directories';

export type IOriginalFile = Pick<InferSelectModel<typeof files>, 'id' | 'directoryId' | 'name'>;
export type IEditedFile = IPutDirectoryInput['editedFiles'][number] & { targetDir?: IDir; originalFile: IOriginalFile; };

export async function getFilesToEdit(
	input: IPutDirectoryInput['editedFiles'],
	allDirs: Map<number | null, IDir>,
	deletedFileIds: number[],
	originalFiles: Map<number, IOriginalFile>,
	rootPath = '/'
): Promise<{
	filesToEdit: IEditedFile[];
	errors: Record<number, Record<string, string>>;
}> {
	const filesToEdit: IEditedFile[] = [];

	const errors: Record<number, Record<string, string>> = {};
	function setError(index: number, key: keyof IPutDirectoryInput['editedFiles'][number], value: string) {
		errors[index] ||= {};
		errors[index][key] = value;
	};

	// eslint-disable-next-line no-restricted-syntax
	outerLoop: for (let i = 0; i < input.length; i++) {
		const file = input[i];
		const originalFile = originalFiles.get(file.id);
		if (!originalFile) {
			setError(i, 'id', 'plik nie istnieje');
			continue;
		}

		let count = 0;
		for (let j = 0; j < input.length; j++) {
			const otherFile = input[j];
			if (file.id === otherFile.id) {
				count += 1;
			} else if (file.directoryId === otherFile.directoryId && file.name === otherFile.name) {
				setError(i, 'name', 'wiele plików nie może być przeniesione w to samo miejsce');
				continue outerLoop;
			}
		}

		if (count > 1) {
			setError(i, 'id', 'tylko jedna instrukcja może być wysłana naraz');
			continue;
		}

		if (deletedFileIds.includes(file.id)) {
			continue;
		}

		const targetDir = allDirs.get(file.directoryId);
		if (file.directoryId !== null && !targetDir) {
			setError(i, 'directoryId', 'wybrany folder nie istnieje');
			continue;
		}

		let targetDirPath = rootPath;
		if (file.directoryId !== null) {
			if (!targetDir) {
				throw new Error('target not found for dir moved to non-root');
			}
			targetDirPath = `${targetDir.path}/`;
		}

		const newPath = `${filesStoragePath}${targetDirPath}${file.name}`;
		const somethingExists = existsSync(newPath);
		if (somethingExists) {
			const stats = await lstat(newPath);
			if (!stats.isDirectory()) {
				setError(i, 'name', 'plik o podanej nazwie istnieje w wybranej lokacji');
				continue;
			}
		}

		filesToEdit.push({
			...file,
			targetDir,
			originalFile,
		});
	}

	return { filesToEdit, errors };
}
