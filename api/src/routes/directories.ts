import { Hono } from 'hono';
import { eq, isNull } from 'drizzle-orm';
import { custom, object, string, transform } from 'valibot';
import { directories, insertDirectorySchema } from '../db/schema/directories';
import { files } from '../db/schema/files';
import { wrap } from '../helpers';
import { db } from '../db';

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

		const [{ insertId }] = await db
			.insert(directories)
			.values(input);

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
		wrap('param', transform(object({
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
		}))),
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
