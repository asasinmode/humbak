import { Hono } from 'hono';
import { eq, isNull } from 'drizzle-orm';
import { custom, object, string, transform } from 'valibot';
import { directories } from '../db/schema/directories';
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

			const result = await db
				.select({
					id: directories.id,
					parentId: directories.parentId,
					name: directories.name,
				})
				.from(directories)
				.where(id === null ? isNull(directories.parentId) : eq(directories.parentId, id));

			return c.json(result);
		}
	);

export type AppType = typeof app;
