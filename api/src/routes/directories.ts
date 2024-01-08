import { existsSync } from 'node:fs';
import { lstat, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { Hono, type MiddlewareHandler } from 'hono';
import { type InferSelectModel, eq, inArray, isNull, sql } from 'drizzle-orm';
import { type Input, array, custom, null_, number, object, string, transform, union } from 'valibot';
import { parsePageHtml } from 'src/helpers/pages';
import { directories, insertDirectorySchema } from '../db/schema/directories';
import { files, insertFileSchema } from '../db/schema/files';
import { filesToPages } from '../db/schema/filesToPages';
import { contents } from '../db/schema/contents';
import { wrap } from '../helpers';
import { adminFilesPath } from '../helpers/files';
import { db } from '../db';

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
type IPutDirectoryInput = Input<typeof putDirectoryInput>;

export const app = new Hono<{
	Variables: {
		targetDir?: Pick<InferSelectModel<typeof directories>, 'path'>;
		dirs?: IDir[];
		dirsToDelete?: IDir[];
		dirsToEdit?: IPutDirectoryInput['editedDirs'];
		filesToEdit?: IPutDirectoryInput['editedFiles'];
		allDirsBeingDeleted?: IDir[];
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

			await mkdir(`${adminFilesPath}${path}`);

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
			const dirs: IDir[] = await db.select({
				path: directories.path,
				id: directories.id,
				name: directories.name,
				parentId: directories.parentId,
			}).from(directories);
			c.set('dirs', dirs);
			const dirsToDelete = dirs.filter(dir => input.deletedDirIds.includes(dir.id));
			c.set('dirsToDelete', dirsToDelete);
			const allDirsBeingDeleted = getAllDirsToDelete(dirs, dirsToDelete);
			c.set('dirsToDeleteAll', []);

			type IEditedDir = IPutDirectoryInput['editedDirs'][number];
			const dirsToEdit: IEditedDir[] = [];
			const editedDirsErrors: Record<string | number, Record<string, string>> = {};
			function setEditedDirsError(index: number, key: keyof IEditedDir, value: string) {
				editedDirsErrors[index] ||= {};
				editedDirsErrors[index][key] = value;
			};

			// eslint-disable-next-line no-restricted-syntax, no-labels
			outerDirLoop: for (let i = 0; i < input.editedDirs.length; i++) {
				const dir = input.editedDirs[i];
				const originalDir = dirs.find(d => d.id === dir.id);
				if (!originalDir) {
					setEditedDirsError(i, 'id', 'folder nie istnieje');
					continue;
				}
				const isDeleted = allDirsBeingDeleted!.some(d => d.id === dir.id || d.id === dir.parentId);
				if (isDeleted) {
					continue;
				}

				const hasMoved = dir.parentId !== originalDir.parentId || dir.name !== originalDir.name;
				if (!hasMoved) {
					continue;
				}

				const target = dirs.find(d => d.id === dir.parentId);
				if (dir.parentId !== null) {
					if (!target) {
						setEditedDirsError(i, 'parentId', 'wybrany folder nie istnieje');
						continue;
					}

					// moved to itself
					if (dir.id === target.id) {
						continue;
					}

					let parent: IDir | undefined = target;
					while (parent) {
						if (parent.parentId === dir.id) {
							setEditedDirsError(i, 'parentId', 'folder nie może być przeniesiony do swojego podfolderu');
							// eslint-disable-next-line no-labels
							continue outerDirLoop;
						}
						parent = dirs.find(d => d.id === parent!.parentId);
					}
				}

				let targetDirPath = '/';
				if (dir.parentId !== null) {
					if (!target) {
						throw new Error('target should\'ve been set by now');
					}
					targetDirPath = `${target.path}/`;
				}

				const newPath = `${adminFilesPath}${targetDirPath}${dir.name}`;
				const somethingExists = existsSync(newPath);
				if (somethingExists) {
					const stats = await lstat(newPath);
					if (stats.isDirectory()) {
						setEditedDirsError(i, 'name', 'folder o podanej nazwie istnieje w wybranej lokacji');
						continue;
					}
				}

				dirsToEdit.push(dir);
			}

			for (let i = 0; i < input.editedDirs.length; i++) {
				const dir = input.editedDirs[i];
				if (!dirsToEdit.some(d => d.id === dir.id)) {
					continue;
				}

				for (const otherDir of dirsToEdit) {
					if (otherDir.id === dir.id) {
						continue;
					}
					const sameParent = dir.parentId === otherDir.parentId;
					if (!sameParent) {
						continue;
					}
					const sameName = dir.name === otherDir.name;
					if (sameName) {
						setEditedDirsError(i, 'name', 'dwa foldery nie mogą mieć tej samej nazwy');
						break;
					}
				}
			}

			type IEditedFile = (typeof input)['editedFiles'][number];
			const filesToEdit: IEditedFile[] = [];
			const editedFilesErrors: Record<string | number, Record<string, string>> = {};
			function setEditedFilesError(index: number, key: keyof IEditedFile, value: string) {
				editedFilesErrors[index] ||= {};
				editedFilesErrors[index][key] = value;
			};
			const originalFiles = input.editedFiles.length
				? await
				db.select({
					id: files.id,
					directoryId: files.directoryId,
					name: files.name,
				})
					.from(files)
					.where(inArray(files.id, input.editedFiles.map(f => f.id)))
				: [];

			for (let i = 0; i < input.editedFiles.length; i++) {
				const file = input.editedFiles[i];

				const originalFile = originalFiles.find(f => f.id === file.id);
				if (!originalFile) {
					setEditedFilesError(i, 'id', 'plik nie istnieje');
					continue;
				}

				const isDeleted = allDirsBeingDeleted!.some(dir => file.directoryId === null || file.directoryId === dir.id);
				if (isDeleted) {
					continue;
				}

				let targetDirPath = '/';
				if (file.directoryId !== null) {
					const targetDir = dirs.find(d => d.id === file.directoryId);
					if (!targetDir) {
						setEditedFilesError(i, 'directoryId', 'wybrany rodzic nie istnieje');
						continue;
					}
					targetDirPath = `${targetDir.path}/`;
				}

				const newPath = `${adminFilesPath}${targetDirPath}/${file.name}`;
				const hasMoved = file.directoryId !== originalFile.directoryId || file.name !== originalFile.name;
				const somethingExists = hasMoved && existsSync(newPath);
				if (somethingExists) {
					const stats = await lstat(newPath);
					if (!stats.isDirectory()) {
						setEditedFilesError(i, 'name', 'plik o podanej nazwie istnieje w wybranej lokacji');
						continue;
					}
				}

				filesToEdit.push(file);
			}

			for (let i = 0; i < input.editedFiles.length; i++) {
				const file = input.editedFiles[i];
				if (!filesToEdit.some(f => f.id === file.id)) {
					continue;
				}

				for (const otherFile of filesToEdit) {
					if (otherFile.id === file.id) {
						continue;
					}
					const sameParent = file.directoryId === otherFile.directoryId;
					if (!sameParent) {
						continue;
					}
					const sameName = file.name === otherFile.name;
					if (sameName) {
						setEditedFilesError(i, 'directoryId', 'dwa pliki nie mogą mieć tej samej nazwy');
						break;
					}
				}
			}

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

			const dirs = c.get('dirs');
			if (!dirs) {
				throw new Error('dirs from middleware not found');
			}
			const dirsToDelete = c.get('dirsToDelete');
			if (!dirsToDelete) {
				throw new Error('dirs to delete from middleware not found');
			}
			const dirsToEdit = c.get('dirsToEdit');
			if (!dirsToEdit) {
				throw new Error('dirs to edit from middleware not found');
			}
			const filesToEdit = c.get('filesToEdit');
			if (!filesToEdit) {
				throw new Error('files to edit from middleware not found');
			}

			if (input.deletedFileIds.length) {
				const deletedFilePaths = await db
					.select({ path: files.path })
					.from(files)
					.where(inArray(files.id, input.deletedFileIds));

				await db.delete(files).where(inArray(files.id, input.deletedFileIds));
				for (const { path } of deletedFilePaths) {
					existsSync(`${adminFilesPath}/${path}`) && await rm(`${adminFilesPath}/${path}`);
				}
			}

			const updatedFilesIds: number[] = [];

			if (filesToEdit.length) {
				const originalFiles = await db
					.select({
						id: files.id,
						directoryId: files.directoryId,
						name: files.name,
						path: files.path,
					})
					.from(files)
					.where(inArray(files.id, filesToEdit.map(f => f.id)));

				for (const file of filesToEdit) {
					const originalFile = originalFiles.find(f => f.id === file.id);
					if (!originalFile) {
						console.error('FILE to edit not found in db');
						continue;
					}

					if (!updatedFilesIds.includes(originalFile.id)) {
						updatedFilesIds.push(originalFile.id);
					}

					const hasMoved = originalFile.directoryId !== file.directoryId || file.name !== originalFile.name;
					let path = originalFile.path;
					if (hasMoved) {
						let targetDirPath = '/';
						if (file.directoryId !== null) {
							const targetDir = dirs.find(d => d.id === file.directoryId);
							if (!targetDir) {
								console.error('FILE to edit parent dir not found');
								continue;
							}
							targetDirPath = `${targetDir.path}/`;
						}

						const oldPath = `${adminFilesPath}${originalFile.path}`;
						const oldPathExists = existsSync(oldPath);
						const newPathExists = existsSync(`${adminFilesPath}${targetDirPath}`);
						if (!oldPathExists) {
							console.error('FILE to edit OLD path doesn\'t exist');
							continue;
						}
						if (!newPathExists) {
							console.error('FILE to edit NEW path doesn\'t exist');
							continue;
						}

						const newPath = `${adminFilesPath}${targetDirPath}/${file.name}`;
						await rename(oldPath, newPath);
						path = `${targetDirPath}${file.name}`;
					}

					await db
						.update(files)
						.set({
							name: file.name,
							title: file.title,
							alt: file.alt,
							directoryId: file.directoryId,
							path,
							updatedAt: new Date(),
						})
						.where(eq(files.id, file.id));
				}
			}

			if (dirsToDelete.length) {
				const dirsToDeleteIds = dirsToDelete.map(dir => dir.id);
				await db.delete(directories).where(inArray(directories.id, dirsToDeleteIds));

				for (const dir of dirsToDelete) {
					const path = `${adminFilesPath}${dir.path}`;
					existsSync(path) && await rm(path, { recursive: true });
				}
			}

			while (dirsToEdit.length) {
				const dirsToGoThrough: (typeof dirsToEdit)[number][] = [];

				for (let i = 0; i < dirsToEdit.length; i++) {
					const { parentId } = dirsToEdit[i];
					const parentIds: number[] = [];
					let parent = dirs.find(d => d.id === parentId);
					while (parent) {
						parentIds.push(parent.id);
						parent = dirs.find(d => d.id === parent!.parentId);
					}

					const isParentBeingEdited = parentIds.some(id =>
						dirsToGoThrough.some(dir => dir.id === id) || dirsToEdit.some(dir => dir.id === id)
					);
					if (!isParentBeingEdited) {
						const [dir] = dirsToEdit.splice(i, 1);
						dirsToGoThrough.push(dir);
						i--;
					}
				}

				for (const dir of dirsToGoThrough) {
					const originalDirIndex = dirs.findIndex(d => d.id === dir.id);
					if (originalDirIndex === -1) {
						console.error('DIR to edit not found');
						continue;
					}
					const originalDir = dirs[originalDirIndex];

					let targetDirPath = '/';
					if (dir.parentId !== null) {
						const targetDir = dirs.find(d => d.id === dir.parentId);
						if (!targetDir) {
							console.error('DIR to edit parent dir not found');
							continue;
						}
						targetDirPath = `${targetDir.path}/`;
					}

					const oldPath = `${adminFilesPath}${originalDir.path}`;
					const oldPathExists = existsSync(oldPath);
					const newPathExists = existsSync(`${adminFilesPath}${targetDirPath}`);
					if (!oldPathExists) {
						console.error('DIR to edit OLD path doesn\'t exist');
						continue;
					}
					if (!newPathExists) {
						console.error('DIR to edit NEW path doesn\'t exist');
						continue;
					}

					const path = `${targetDirPath}${dir.name}`;
					const newPath = `${adminFilesPath}${path}`;
					await rename(oldPath, newPath);

					await Promise.all([
						db
							.update(directories)
							.set({
								name: dir.name,
								parentId: dir.parentId,
								path,
								updatedAt: new Date(),
							})
							.where(eq(directories.id, dir.id)),
						db.execute(sql`UPDATE files JOIN directories ON files.directoryId = directories.id SET files.path = CONCAT(directories.path, '/', files.name) WHERE directories.id = ${dir.id}`),
					]);

					const associatedFiles = await db.select({ id: files.id }).from(files).where(eq(files.directoryId, dir.id));
					for (const { id } of associatedFiles) {
						!updatedFilesIds.includes(id) && updatedFilesIds.push(id);
					}

					dirs[originalDirIndex] = {
						id: dir.id,
						parentId: dir.parentId,
						name: dir.name,
						path,
					};
					for (let i = 0; i < dirs.length; i++) {
						const originalChildDir = dirs[i];
						if (originalChildDir.parentId === dir.id) {
							dirs[i].path = `${path}/${originalChildDir.name}`;
						}
					}
				}
			}

			if (updatedFilesIds.length) {
				const contentsToUpdate = await db
					.selectDistinct({
						pageId: contents.pageId,
						rawHtml: contents.rawHtml,
					})
					.from(contents)
					.leftJoin(filesToPages, eq(contents.pageId, filesToPages.pageId))
					.where(inArray(filesToPages.fileId, updatedFilesIds));
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
					const newPath = `${adminFilesPath}${targetDirPath}${file.name}`;
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
				await writeFile(`${adminFilesPath}${file.path}`, file.file);
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

type IDir = Pick<InferSelectModel<typeof directories>, 'id' | 'name' | 'parentId' | 'path'>;
function getAllDirsToDelete(allDirs: IDir[], dirsToDelete: IDir[], acc: IDir[] = []) {
	for (const dir of dirsToDelete) {
		acc.push(dir);
		const childrenToDelete = allDirs.filter(child => child.parentId === dir.id);
		for (const child of getAllDirsToDelete(allDirs, childrenToDelete)) {
			acc.push(child);
		}
	}
	return acc;
}
