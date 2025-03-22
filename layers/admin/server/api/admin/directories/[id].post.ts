import type { InferSelectModel } from 'drizzle-orm';
import fs from 'node:fs/promises';

const { directories, files } = tables;

interface IFile extends Pick<
	InferSelectModel<typeof files>,
	'directoryId' | 'title' | 'alt' | 'path' | 'name' | 'mimetype'
> {
	file: Uint8Array;
	width?: number;
	height?: number;
};

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const { id } = useValidatedParams(event, dirIdParamValidation);
	await getTargetDir(true, id);

	const dirs: IDir[] = await db.select({
		path: directories.path,
		id: directories.id,
		name: directories.name,
		parentId: directories.parentId,
	}).from(directories);

	const rawInput = await readMultipartFormData(event);
	if (typeof rawInput !== 'object') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
			data: { message: 'musi być formdata' },
		});
	}
	const input: Record<string, string> = rawInput.reduce((acc, curr) => {
		if (!curr.name) {
			return acc;
		}

		const value = curr.filename && curr.type
			? new File([curr.data], curr.filename, { type: curr.type })
			: curr.data.toString('utf-8');

		return {
			...acc,
			[curr.name]: value,
		};
	}, {});

	const errors: Record<string | number, Record<string, string>> = {};
	function setError(index: number, key: keyof IFile, value: string) {
		errors[index] ||= {};
		errors[index][key] = value;
	};

	const length = Math.floor(Object.keys(input).length / 4);
	if (length === 0) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
			data: { message: 'nieprawidłowy format' },
		});
	}

	const filesToSave: IFile[] = [];
	for (let i = 0; i < length; i++) {
		let targetDirPath = '/';
		let directoryId: number | null | undefined;

		const rawDirectoryId = input[`directoryId[${i}]`] as string | undefined;
		if (rawDirectoryId === undefined) {
			setError(i, 'directoryId', 'nie może być puste');
		} else if (typeof rawDirectoryId !== 'string') {
			setError(i, 'directoryId', 'musi być tekstem');
		} else {
			const parsedDirectoryId = Number.parseInt(rawDirectoryId);
			directoryId = rawDirectoryId === 'null' ? null : Number.isNaN(parsedDirectoryId) ? undefined : parsedDirectoryId;

			if (directoryId === undefined) {
				setError(i, 'directoryId', 'nieprawidłowy format');
			} else if (directoryId !== null) {
				const target = dirs.find(d => d.id === directoryId);
				if (target) {
					targetDirPath = `${target.path}/`;
				} else {
					setError(i, 'directoryId', 'wybrany folder nie istnieje');
				}
			}
		}

		const alt = input[`alt[${i}]`] || '';
		if (typeof alt !== 'string') {
			setError(i, 'alt', 'musi być tekstem');
		}

		const title = input[`title[${i}]`] || '';
		if (typeof title !== 'string') {
			setError(i, 'title', 'musi być tekstem');
		}

		const file = input[`file[${i}]`] as unknown as File;
		if (!(file instanceof File)) {
			setError(i, 'file', 'musi być plikiem');
		}

		if (!file.name) {
			setError(i, 'name', 'nie może być puste');
		} else {
			if (await imageWithSameNameExists(`${filesStoragePath}${targetDirPath}`, file.name, file.type)) {
				setError(i, 'name', 'plik o podanej nazwie istnieje w wybranej lokacji');
				continue;
			}
		}

		if (errors[i]) {
			continue;
		}

		if (directoryId === undefined) {
			throw new Error('directoryId should\'ve been set by now');
		}

		filesToSave.push({
			alt: alt as string,
			title: title as string,
			path: `${targetDirPath}${file.name}`,
			name: file.name,
			mimetype: file.type,
			directoryId,
			file: new Uint8Array(await file.arrayBuffer()),
		});
	}

	for (let i = 0; i < filesToSave.length; i++) {
		const file = filesToSave[i]!;
		const sameNameAndDirCount = filesToSave.filter(f => f.name === file.name && f.directoryId === file.directoryId).length;

		if (sameNameAndDirCount > 1) {
			setError(i, 'name', 'dwa pliki nie mogą mieć tej samej nazwy');
		}
	}

	if (Object.keys(errors).length) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
			data: { newFiles: errors },
		});
	}

	for (const file of filesToSave) {
		await fs.writeFile(`${filesStoragePath}${file.path}`, file.file);
		const { width, height } = await createImageSizes(`${filesStoragePath}${file.path}`, file.mimetype);
		file.width = width;
		file.height = height;
	}
	if (filesToSave.length) {
		await db.insert(files).values(filesToSave.map(file => ({
			title: file.title,
			alt: file.alt,
			name: file.name,
			path: file.path,
			mimetype: file.mimetype,
			directoryId: file.directoryId,
			width: file.width,
			height: file.height,
		})));
	}

	return await dirData(id, true);
});
