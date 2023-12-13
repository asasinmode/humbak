import { Hono } from 'hono';
import { directories } from 'src/db/schema/directories';
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
	});

export type AppType = typeof app;
