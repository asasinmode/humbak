import type { InferSelectModel } from 'drizzle-orm';
import { imageWithSameNameExists } from '~~/server/utils/image';

export type IOriginalFile = Pick<InferSelectModel<typeof tables.files>, 'id' | 'directoryId' | 'path' | 'name' | 'mimetype'>;
export type IEditedFile = IPutDirectoryInput['editedFiles'][number] & { targetDir?: IDir; originalFile: IOriginalFile };

export async function getFilesToEdit(
	input: IPutDirectoryInput['editedFiles'],
	allDirs: Map<number | null, IDir>,
	deletedFileIds: number[],
	originalFiles: Map<number, IOriginalFile>,
	rootPath = '/',
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

	outerLoop: for (let i = 0; i < input.length; i++) {
		const file = input[i]!;
		const originalFile = originalFiles.get(file.id);
		if (!originalFile) {
			setError(i, 'id', 'plik nie istnieje');
			continue;
		}

		let count = 0;
		for (let j = 0; j < input.length; j++) {
			const otherFile = input[j]!;
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

		const hasMoved = originalFile.directoryId !== file.directoryId || file.name !== originalFile.name;
		if (hasMoved) {
			if (await imageWithSameNameExists(`${filesStoragePath}${targetDirPath}`, file.name, originalFile.mimetype)) {
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
