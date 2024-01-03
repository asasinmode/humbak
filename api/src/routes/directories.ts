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
	while (dirsToDelete.length) {
		const dir = dirsToDelete.pop()!;
		acc.push(dir);
		const childrenToDelete = allDirs.filter(child => child.parentId === dir.id);
		for (const child of getAllDirsToDelete(allDirs, childrenToDelete)) {
			acc.push(child);
		}
	}
	return acc;
}

export const app = new Hono<{
	Variables: {
		targetDir?: Pick<InferSelectModel<typeof directories>, 'path'>;
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
		async (c) => {
			const input = c.req.valid('json');

			const dirs: IDir[] = await db.select({
				path: directories.path,
				id: directories.id,
				name: directories.name,
				parentId: directories.parentId,
			}).from(directories);

			let dirsToDelete: IDir[] = [];
			for (const id of input.deletedDirIds) {
				const dir = dirs.find(d => d.id === id);
				if (dir) {
					dirsToDelete.push(dir);
				}
			}
			console.log('dirs to delete', dirsToDelete);

			const dirsToEdit = input.editedDirs
				.filter((dir) => {
					const original = dirs.find(d => d.id === dir.id);
					if (!original) {
						return false;
					}

					const isDeleted = dirsToDelete.some(d => d.id === dir.id || d.id === dir.parentId);
					if (isDeleted) {
						return false;
					}

					const isMoved = original.parentId !== dir.parentId || original.name !== dir.name;
					if (!isMoved) {
						return true;
					}

					if (dir.parentId === null) {
						return original.parentId !== dir.parentId;
					}

					const target = dirs.find(d => d.id === dir.parentId);
					if (!target) {
						return false;
					}

					// moved to itself
					if (dir.id === target.id) {
						return false;
					}

					// moved to its child
					let parent: IDir | undefined = target;
					while (parent) {
						if (parent.parentId === dir.id) {
							return false;
						}
						parent = dirs.find(d => d.id === parent!.parentId);
					}

					return true;
				});
			console.log('dirs to edit', dirsToEdit);

			const filesToEdit = input.editedFiles.filter((file) => {
				const isDeleted = dirsToDelete.some(dir => file.directoryId === null || file.directoryId === dir.id);
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

			console.log('files to edit', filesToEdit);

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
						console.error('file to edit not found in db');
						continue;
					}

					const hasMoved = originalFile.directoryId !== file.directoryId || file.name !== originalFile.name;
					let path = originalFile.path;
					if (hasMoved) {
						let targetDirPath = '/';
						if (file.directoryId !== null) {
							const targetDir = dirs.find(d => d.id === file.directoryId);
							if (!targetDir) {
								console.error('file to edit target dir not found');
								continue;
							}
							targetDirPath = `${targetDir.path}/`;
						}

						const oldPath = `${adminFilesPath}${originalFile.path}`;
						const oldPathExists = existsSync(oldPath);
						const newPathExists = existsSync(`${adminFilesPath}${targetDirPath}`);
						if (!oldPathExists) {
							console.error('file to edit OLD path doesn\'t exist');
							continue;
						}
						if (!newPathExists) {
							console.error('file to edit NEW path doesn\'t exist');
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

			dirsToDelete = getAllDirsToDelete(dirs, dirsToDelete);
			console.log('all dirs to delete', dirsToDelete);
			// for (const dir of dirsToDelete) {
			// 	const childrenDirs: IDir[] = [];

			// // await db.delete(files).where(eq(files.directoryId, dir.id));
			// }

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

// UPDATE files
// JOIN directories ON files.directoryId = directories.id
// SET files.path = CONCAT(directories.path, '/', files.name)
// WHERE directories.id = 1;

export type AppType = typeof app;
