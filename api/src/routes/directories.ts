import { existsSync } from 'node:fs';
import { lstat, mkdir, writeFile } from 'node:fs/promises';
import { Hono, type MiddlewareHandler } from 'hono';
import { type InferSelectModel, eq, inArray, isNull, sql } from 'drizzle-orm';
import { type Input, array, custom, null_, number, object, string, transform, union } from 'valibot';
import { processDeletedDirs } from 'src/helpers/files/dirDeleteProcessing';
import { parsePageHtml } from '../helpers/pages';
import { db } from '../db';
import { directories, insertDirectorySchema } from '../db/schema/directories';
import { files, insertFileSchema } from '../db/schema/files';
import { contents } from '../db/schema/contents';
import { wrap } from '../helpers';
import { filesStoragePath } from '../helpers/files';
import { getDirsToDelete } from '../helpers/files/dirDeleteValidation';
import { getDirsToEdit } from '../helpers/files/dirEditValidation';
import { getFilesToEdit } from '../helpers/files/fileEditValidation';
import { processDeletedFiles } from '../helpers/files/fileDeleteProcessing';
import { processEditedFiles } from '../helpers/files/fileEditProcessing';
import { processEditedDirs } from '../helpers/files/dirEditProcessing';
import type { IEditedFile, IOriginalFile } from '../helpers/files/fileEditValidation';
import type { IEditedDir } from '../helpers/files/dirEditValidation';

const dirIdParamValidation = wrap('param', transform(object({
	id: string([
		custom((v) => {
			if (v === 'null') {
				return true;
			}
			if (Number.isNaN(Number.parseInt(v))) {
				return false;
			}
			return true;
		}, 'musi być liczbą lub null'),
	]),
}), ({ id }) => ({
	id: id === 'null' ? null : Number.parseInt(id),
})));

const putDirectoryInput = object({
	deletedFileIds: array(number()),
	editedFiles: array(object({
		id: number(),
		name: insertFileSchema.entries.name,
		title: insertFileSchema.entries.title,
		alt: insertFileSchema.entries.alt,
		directoryId: union([number(), null_()]),
	})),
	deletedDirIds: array(number()),
	editedDirs: array(object({
		id: number(),
		name: insertDirectorySchema.entries.name,
		parentId: union([number(), null_()]),
	})),
});
export type IPutDirectoryInput = Input<typeof putDirectoryInput>;
export type IDir = Pick<InferSelectModel<typeof directories>, 'id' | 'name' | 'parentId' | 'path'>;

export const app = new Hono<{
	Variables: {
		targetDir?: Pick<InferSelectModel<typeof directories>, 'path'>;
		allDirs: Map<number, IDir>;
		allDirsArray: IDir[];
		dirsToDelete: Map<number, IDir>;
		filesToEdit: IEditedFile[];
		dirsToEdit: IEditedDir[];
	};
}>()
	.get('/', async (c) => {
		const result = await db
			.select({
				id: directories.id,
				parentId: directories.parentId,
				name: directories.name,
			})
			.from(directories);

		return c.json(result);
	})
	.post(
		'/',
		wrap('json', insertDirectorySchema),
		targetMiddleware(false),
		async (c) => {
			const input = c.req.valid('json');
			const target = c.get('targetDir');

			let targetDirPath = '/';
			if (target) {
				targetDirPath = `${target.path}/`;
			};
			const path = `${targetDirPath}${input.name}`;

			const [{ insertId }] = await db
				.insert(directories)
				.values({ ...input, path });

			await mkdir(`${filesStoragePath}${path}`);

			const [result] = await db
				.select({
					id: directories.id,
					parentId: directories.parentId,
					name: directories.name,
				})
				.from(directories)
				.where(eq(directories.id, insertId))
				.orderBy(directories.name);

			return c.json(result);
		}
	)
	.put(
		'/',
		wrap('json', putDirectoryInput),
		async (c, next) => {
			const input = c.req.valid('json');
			const allDirsArray: IDir[] = await db.select({
				path: directories.path,
				id: directories.id,
				name: directories.name,
				parentId: directories.parentId,
			}).from(directories);
			const allDirs: Map<number, IDir> = new Map(allDirsArray.map(d => [d.id, d]));
			c.set('allDirs', allDirs);
			c.set('allDirsArray', allDirsArray);

			const dirsToDelete = getDirsToDelete(input.deletedDirIds, allDirs, allDirsArray);
			c.set('dirsToDelete', dirsToDelete);
			const { dirsToEdit, errors: editedDirsErrors } = await getDirsToEdit(
				input.editedDirs,
				allDirs,
				allDirsArray,
				dirsToDelete
			);

			const originalFilesArray: IOriginalFile[] = input.editedFiles.length
				? await db
					.select({
						id: files.id,
						directoryId: files.directoryId,
						path: files.path,
						name: files.name,
					})
					.from(files)
					.where(inArray(files.id, input.editedFiles.map(f => f.id)))
				: [];
			const originalFiles = new Map(originalFilesArray.map(f => [f.id, f]));

			const { filesToEdit, errors: editedFilesErrors } = await getFilesToEdit(
				input.editedFiles,
				allDirs,
				input.deletedFileIds,
				originalFiles
			);

			const anyDirErrors = Object.keys(editedDirsErrors).length;
			const anyFileErrors = Object.keys(editedFilesErrors).length;
			if (anyDirErrors || anyFileErrors) {
				return c.json({
					editedDirs: anyDirErrors ? editedDirsErrors : undefined,
					editedFiles: anyFileErrors ? editedFilesErrors : undefined,
				}, 400);
			}

			c.set('dirsToEdit', dirsToEdit);
			c.set('filesToEdit', filesToEdit);
			await next();
		},
		async (c) => {
			const input = c.req.valid('json');

			const allDirs = c.get('allDirs');
			if (!allDirs) {
				throw new Error('all dirs from middleware undefined');
			}
			const allDirsArray = c.get('allDirsArray');
			if (!allDirsArray) {
				throw new Error('all dirs array from middleware undefined');
			}
			const filesToEdit = c.get('filesToEdit');
			if (!filesToEdit) {
				throw new Error('files to edit from middleware undefined');
			}
			const dirsToDelete = c.get('dirsToDelete');
			if (!dirsToDelete) {
				throw new Error('dirs to delete from middleware undefined');
			}
			const dirsToEdit = c.get('dirsToEdit');
			if (!dirsToEdit) {
				throw new Error('dirs to edit from middleware undefined');
			}

			const modifiedPagesIds = new Set<number>();

			await processDeletedFiles(input.deletedFileIds, modifiedPagesIds);
			await processEditedFiles(filesToEdit, modifiedPagesIds);
			await processDeletedDirs(dirsToDelete, allDirs, allDirsArray, modifiedPagesIds);
			await processEditedDirs(dirsToEdit, allDirs, allDirsArray, modifiedPagesIds);

			if (modifiedPagesIds.size) {
				const contentsToUpdate = await db
					.selectDistinct({
						pageId: contents.pageId,
						rawHtml: contents.rawHtml,
					})
					.from(contents)
					.where(inArray(contents.pageId, Array.from(modifiedPagesIds)));
				for (const { pageId, rawHtml } of contentsToUpdate) {
					const { value } = await parsePageHtml(rawHtml);
					await db.update(contents).set({ parsedHtml: value }).where(eq(contents.pageId, pageId));
				}
			}

			const returnDirHeader = c.req.header('return-for-dir') || '';
			const parseResult = Number.parseInt(returnDirHeader);
			const returnForDirId = returnDirHeader === 'null'
				? null
				: !Number.isNaN(parseResult)
						? parseResult
						: undefined;
			if (returnForDirId !== undefined) {
				return c.json(await dirData(returnForDirId, true));
			}

			return c.body(null, 204);
		}
	)
	.get(
		'/:id',
		dirIdParamValidation,
		targetMiddleware(true),
		async (c) => {
			const { id } = c.req.valid('param');

			return c.json(await dirData(id, false));
		}
	)
	.post(
		'/:id',
		dirIdParamValidation,
		targetMiddleware(true),
		async (c) => {
			const { id } = c.req.valid('param');
			const dirs: IDir[] = await db.select({
				path: directories.path,
				id: directories.id,
				name: directories.name,
				parentId: directories.parentId,
			}).from(directories);

			const input = await c.req.parseBody();
			if (typeof input !== 'object') {
				return c.json({ message: 'musi być formdata' }, 400);
			}

			type IFile = Pick<InferSelectModel<typeof files>, 'directoryId' | 'title' | 'alt' | 'path' | 'name' | 'mimetype'> & { file: Uint8Array; };
			const errors: Record<string | number, Record<string, string>> = {};
			function setError(index: number, key: keyof IFile, value: string) {
				errors[index] ||= {};
				errors[index][key] = value;
			};

			const length = Math.floor(Object.keys(input).length / 4);
			if (length === 0) {
				return c.json({ message: 'nieprawidłowy format' }, 400);
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

				const file = input[`file[${i}]`] as File;
				if (!(file instanceof File)) {
					setError(i, 'file', 'musi być plikiem');
				}

				if (!file.name) {
					setError(i, 'name', 'nie może być puste');
				} else {
					const newPath = `${filesStoragePath}${targetDirPath}${file.name}`;
					const somethingExists = existsSync(newPath);
					if (somethingExists) {
						const stats = await lstat(newPath);
						if (!stats.isDirectory()) {
							setError(i, 'name', 'plik o podanej nazwie istnieje w wybranej lokacji');
							continue;
						}
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
				const file = filesToSave[i];
				const sameNameAndDirCount = filesToSave.filter(f => f.name === file.name && f.directoryId === file.directoryId).length;

				if (sameNameAndDirCount > 1) {
					setError(i, 'name', 'dwa pliki nie mogą mieć tej samej nazwy');
				}
			}

			if (Object.keys(errors).length) {
				return c.json({ newFiles: errors }, 400);
			}

			if (filesToSave.length) {
				await db.insert(files).values(filesToSave.map(file => ({
					title: file.title,
					alt: file.alt,
					name: file.name,
					path: file.path,
					mimetype: file.mimetype,
					directoryId: file.directoryId,
				})));
			}
			for (const file of filesToSave) {
				await writeFile(`${filesStoragePath}${file.path}`, file.file);
			}

			return c.json(await dirData(id, true));
		}
	);

function targetMiddleware(isParam: boolean): MiddlewareHandler {
	return async (c, next) => {
		const id = c.req.valid((isParam ? 'param' : 'json') as never)[isParam ? 'id' : 'parentId'] as number;
		if (id === null) {
			await next();
			return;
		}

		const [dir] = await db.select({
			path: directories.path,
		}).from(directories).where(eq(directories.id, id));

		if (!dir) {
			return isParam ? c.notFound() : c.json({ parentId: 'podany rodzic nie istnieje' }, 400);
		}

		c.set('targetDir', dir);
		await next();
	};
}

async function dirData(id: number | null, returnAllDirs: boolean) {
	const [foundDirectories, foundFiles] = await Promise.all([
		db
			.select({
				id: directories.id,
				parentId: directories.parentId,
				name: directories.name,
			})
			.from(directories)
			.where(returnAllDirs
				? sql`1 = 1`
				: id === null ? isNull(directories.parentId) : eq(directories.parentId, id)
			)
			.orderBy(directories.name),
		db
			.select({
				id: files.id,
				directoryId: files.directoryId,
				path: files.path,
				name: files.name,
				title: files.title,
				alt: files.alt,
				mimetype: files.mimetype,
			})
			.from(files)
			.where(id === null ? isNull(files.directoryId) : eq(files.directoryId, id))
			.orderBy(files.name),
	]);

	return {
		directories: foundDirectories,
		files: foundFiles,
	};
}
