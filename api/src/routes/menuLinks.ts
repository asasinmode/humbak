import { eq, sql } from 'drizzle-orm';
import { array, omit } from 'valibot';
import { Hono } from 'hono';
import { db } from '../db';
import { languageQueryValidation, wrap } from '../helpers';
import { pages } from '../db/schema/pages';
import { insertMenuLinkSchema, menuLinks } from '../db/schema/menuLinks';

export const app = new Hono()
	.get('/', wrap('query', languageQueryValidation), async (c) => {
		const { language } = c.req.valid('query');

		const result = await db
			.select({
				pageId: menuLinks.pageId,
				text: menuLinks.text,
				parentId: menuLinks.parentId,
				position: menuLinks.position,
				href: sql<string>`pages.slug`,
			})
			.from(menuLinks)
			.leftJoin(pages, eq(menuLinks.pageId, pages.id))
			.where(language ? eq(pages.language, language) : undefined);

		return c.json(result);
	})
	.put('/', wrap('json', array(omit(insertMenuLinkSchema, ['text']))), async (c) => {
		const input = c.req.valid('json');

		await Promise.all(input.map(({ pageId, position, parentId }) => db
			.update(menuLinks)
			.set({ position, parentId, updatedAt: new Date() })
			.where(eq(menuLinks.pageId, pageId))
		));

		return c.text('', 201);
	});

export type AppType = typeof app;
