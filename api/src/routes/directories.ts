import { mkdir } from 'node:fs/promises';
import { Hono, type MiddlewareHandler } from 'hono';
import { type InferSelectModel, eq, isNull } from 'drizzle-orm';
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
				.where(eq(directories.id, insertId));

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

			const dirs = await db.select({
				path: directories.path,
				id: directories.id,
				parentId: directories.parentId,
			}).from(directories);
			type IDir = typeof dirs[number];

			const dirsToDelete: IDir[] = [];
			for (const id of input.deletedDirIds) {
				const dir = dirs.find(d => d.id === id);
				if (dir) {
					dirsToDelete.push(dir);
				}
			}
			console.log('dirs to delete', dirsToDelete);

			const dirsToEdit = input.editedDirs.filter((dir) => {
				const original = dirs.find(d => d.id === dir.id);
				if (!original) {
					return false;
				}

				const isMoved = original.parentId !== dir.parentId;
				if (isMoved && !dirs.some(d => d.id === dir.parentId)) {
					return false;
				}

				const isDeleted = dirsToDelete.some(d => d.id === dir.id || d.id === dir.parentId);
				return !isDeleted;
			});
			console.log('dirs to edit', dirsToEdit);

			throw new Error('henlo');

			return c.json({});
		}
	)
	.get(
		'/:id',
		dirIdParamValidation,
		targetMiddleware(true),
		async (c) => {
			const { id } = c.req.valid('param');

			const [foundDirectories, foundFiles] = await Promise.all([
				db
					.select({
						id: directories.id,
						parentId: directories.parentId,
						name: directories.name,
					})
					.from(directories)
					.where(id === null ? isNull(directories.parentId) : eq(directories.parentId, id)),
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
					.where(id === null ? isNull(files.directoryId) : eq(files.directoryId, id)),
			]);

			return c.json({
				directories: foundDirectories,
				files: foundFiles,
			});
		}
	);

export type AppType = typeof app;
