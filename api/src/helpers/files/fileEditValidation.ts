import type { InferSelectModel } from 'drizzle-orm';
import type { files } from 'src/db/schema/files';
import type { IDir, IPutDirectoryInput } from 'src/routes/directories';

type IEditedFile = IPutDirectoryInput['editedFiles'][number];
export type IOriginalFile = Pick<InferSelectModel<typeof files>, 'id' | 'directoryId' | 'name'>;

export async function getFilesToEdit(
	allDirs: Map<number | null, IDir>,
	deletedDirs: Map<number, IDir>,
	deletedFileIds: number[],
	originalFiles: Map<number, IOriginalFile>,
	input: IEditedFile[],
	rootPath = '/'
): Promise<{
	filesToEdit: IEditedFile[];
	errors: Record<number, Record<string, string>>;
}> {
	const filesToEdit: IEditedFile[] = [];

	const errors: Record<number, Record<string, string>> = {};
	function setError(index: number, key: keyof IEditedFile, value: string) {
		errors[index] ||= {};
		errors[index][key] = value;
	};

	for (let i = 0; i < input.length; i++) {
		const file = input[i];
		const originalFile = originalFiles.get(file.id);
		if (!originalFile) {
			setError(i, 'id', 'plik nie istnieje');
			continue;
		}

		filesToEdit.push(file);
	}

	return { filesToEdit, errors };
}
