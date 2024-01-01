import { mkdir } from 'node:fs/promises';
import { Hono } from 'hono';
import { eq, isNull } from 'drizzle-orm';
import { array, custom, null_, number, object, omit, string, transform, union } from 'valibot';
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

export const app = new Hono()
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
	.post('/', wrap('json', insertDirectorySchema), async (c) => {
		const input = c.req.valid('json');

		let path = input.name;

		if (input.parentId !== null) {
			const [parent] = await db.select({
				path: directories.path,
			}).from(directories).where(eq(directories.id, input.parentId));

			if (!parent) {
				return c.json({
					parentId: 'podany rodzic nie istnieje',
				} as unknown as { id: number; parentId: number | null; name: string; }, 400);
			}

			path = `${parent.path}/${path}`;
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
	})
	.get(
		'/:id',
		dirIdParamValidation,
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
	)
	.put(
		'/:id',
		dirIdParamValidation,
		wrap('json', object({
			removedFileIds: array(number()),
			movedFiles: array(object({
				id: number(),
				directoryId: union([number(), null_()]),
			})),
			editedFiles: array(omit(insertFileSchema, ['directoryId', 'mimetype'])),
			removedDirIds: array(number()),
			movedDirs: array(object({
				id: number(),
				parentId: union([number(), null_()]),
			})),
			editedDirs: array(omit(insertDirectorySchema, ['parentId'])),
		})),
		async (c) => {
			const { id } = c.req.valid('param');
			const input = c.req.valid('json');

			console.log('stuff', id, input);
			throw new Error('henlo');

			return c.json({});
		}
	);

export type AppType = typeof app;
