import { Hono } from 'hono';
import { like, sql } from 'drizzle-orm';
import { paginationQueryValidation, wrap } from '../helpers';
import { db } from '../db';
import { files } from '../db/schema/files';

export const app = new Hono()
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
			})
				.from(files)
				.where(query
					? like(files.name, `%${query}%`)
					: sql`1 = 1`)
				.orderBy(files.name)
				.limit(limit)
				.offset(offset * limit),
			db.select({ count: sql<number>`COUNT(*)` })
				.from(files)
				.where(query
					? like(files.name, `%${query}%`)
					: sql`1 = 1`),
		]);

		return c.json({ items, count });
	});
