import { existsSync } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import { Hono, type MiddlewareHandler } from 'hono';
import { type InferSelectModel, eq, inArray, isNull, sql } from 'drizzle-orm';
import { array, custom, null_, number, object, string, transform, union } from 'valibot';
import { directories, insertDirectorySchema } from '../db/schema/directories';
import { files, insertFileSchema } from '../db/schema/files';
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

export const app = new Hono<{
	Variables: {
		targetDir?: Pick<InferSelectModel<typeof directories>, 'path'>;
		dirs?: IDir[];
		dirsToDelete?: IDir[];
		dirsToEdit?: Omit<IDir, 'path'>[];
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

			let path = input.name;

			const target = c.get('targetDir');
			if (target) {
				path = `${target.path}/${path}`;
			}

			const [{ insertId }] = await db
				.insert(directories)
				.values({ ...input, path });

			await mkdir(`${adminFilesPath}/${path}`);

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
		wrap('json', object({
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
		})),
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

			type IEditedDir = (typeof input)['editedDirs'][number];
			const dirsToEdit: IEditedDir[] = [];
			const editedDirsErrors: Record<string | number, Record<string, string>> = {};
			function setEditedDirsError(index: number, key: keyof IEditedDir, value: string) {
				editedDirsErrors[index] ||= {};
				editedDirsErrors[index][key] = value;
			};

			// eslint-disable-next-line no-restricted-syntax,no-labels
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

				if (dir.parentId !== null) {
					const target = dirs.find(d => d.id === dir.parentId);
					if (!target) {
						setEditedDirsError(i, 'parentId', 'wybrany rodzic nie istnieje');
						continue;
					}

					// moved to itself
					if (dir.id === target.id) {
						continue;
					}

					// moved to its child
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

				dirsToEdit.push(dir);
			}

			console.log('errors', editedDirsErrors);
			if (Object.keys(editedDirsErrors).length) {
				return c.json({ editedDirs: editedDirsErrors }, 400);
			}

			console.log('dirs to edit', dirsToEdit);

			c.set('dirsToEdit', dirsToEdit);
			await next();
		},
		async (c) => {
			console.log('TODO check if there are 2 files being moved into the same place');
			const input = c.req.valid('json');

			const dirs = c.get('dirs');
			if (!dirs) {
				throw new Error('dirs from middleware not found');
			}
			const dirsToDelete = c.get('dirsToDelete');
			if (!dirsToDelete) {
				throw new Error('dirs to delete from middleware not found');
			}
			const allDirsBeingDeleted = c.get('allDirsBeingDeleted');
			if (!dirs) {
				throw new Error('all dirs being deleted from middleware not found');
			}
			const dirsToEdit = c.get('dirsToEdit');
			if (!dirsToEdit) {
				throw new Error('all dirs being deleted from middleware not found');
			}

			const filesToEdit = input.editedFiles.filter((file) => {
				const isDeleted = allDirsBeingDeleted!.some(dir => file.directoryId === null || file.directoryId === dir.id);
				return !isDeleted;
			});

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

					await db
						.update(directories)
						.set({
							name: dir.name,
							parentId: dir.parentId,
							path,
						})
						.where(eq(directories.id, dir.id));
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

			return c.json(await dirData(id));
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

async function dirData(id: number | null, isPutResponse = false) {
	const [foundDirectories, foundFiles] = await Promise.all([
		db
			.select({
				id: directories.id,
				parentId: directories.parentId,
				name: directories.name,
			})
			.from(directories)
			.where(isPutResponse
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
