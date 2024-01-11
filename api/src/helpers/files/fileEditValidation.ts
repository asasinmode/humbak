import type { IDir, IPutDirectoryInput } from 'src/routes/directories';

type IEditedFile = IPutDirectoryInput['editedFiles'][number];

export async function getFilesToEdit(
	allDirs: Map<number | null, IDir>,
	deletedDirs: Map<number, IDir>,
	deletedFileIds: number[],
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

	return { filesToEdit, errors };
}
