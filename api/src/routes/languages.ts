import { desc } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db';
import { pages } from '../db/schema/pages';

export const app = new Hono()
	.get('/', async (c) => {
		const result = await db.selectDistinct({ language: pages.language }).from(pages).orderBy(desc(pages.language));

		return c.json(result.map(item => item.language));
	});
