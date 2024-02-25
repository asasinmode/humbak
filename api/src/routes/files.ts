import { Hono } from 'hono';
import { inArray, like, or, sql } from 'drizzle-orm';
import { minLength, object, string } from 'valibot';
import { paginationQueryValidation, wrap } from '../helpers';
import { db } from '../db';
import { files } from '../db/schema/files';

export const app = new Hono<{
	Variables: {
		ids: number[];
	};
}>()
	.get('/', wrap('query', paginationQueryValidation), async (c) => {
		const { query, limit: rawLimit, offset } = c.req.valid('query');
		const limit = Math.min(rawLimit, 100);

		const [items, [{ count }]] = await Promise.all([
			db.select({
				id: files.id,
				path: files.path,
				title: files.title,
				alt: files.alt,
				name: files.name,
				mimetype: files.mimetype,
				width: files.width,
				height: files.height,
			})
				.from(files)
				.where(query
					? or(
						like(files.name, `%${query}%`),
						like(files.title, `%${query}%`),
						like(files.alt, `%${query}%`)
					)
					: sql`1 = 1`)
				.orderBy(files.name)
				.limit(limit)
				.offset(offset),
			db.select({ count: sql<number>`COUNT(*)` })
				.from(files)
				.where(query
					? like(files.name, `%${query}%`)
					: sql`1 = 1`),
		]);

		return c.json({ items, count });
	})
	.get(
		'/byIds',
		wrap('query', object({
			ids: string([minLength(1, 'nie może być puste')]),
		})),
		async (c, next) => {
			const { ids: rawIds } = c.req.valid('query');
			let parsedIds: number[];

			try {
				parsedIds = JSON.parse(rawIds);
			} catch (e: any) {
				return c.json({ ids: e.toString() }, 400);
			}

			if (!Array.isArray(parsedIds)) {
				return c.json({ ids: 'musi być listą' }, 400);
			}

			if (!parsedIds.every(v => typeof v === 'number')) {
				return c.json({ ids: 'elementy muszą być liczbami' }, 400);
			}

			c.set('ids', parsedIds);
			await next();
		},
		async (c) => {
			const ids = c.get('ids');

			const items = await db.select({
				id: files.id,
				path: files.path,
				title: files.title,
				alt: files.alt,
				name: files.name,
				mimetype: files.mimetype,
				width: files.width,
				height: files.height,
			})
				.from(files)
				.where(inArray(files.id, ids));

			return c.json(items);
		}
	);
