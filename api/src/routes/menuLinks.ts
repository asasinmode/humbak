import type { IMenuLink } from '@humbak/shared';
import { and, eq, not, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import * as v from 'valibot';
import { db } from '../db';
import { insertMenuLinkSchema, menuLinks } from '../db/schema/menuLinks';
import { pages } from '../db/schema/pages';
import { languageQueryValidation, wrap } from '../helpers';

export const app = new Hono()
	.get('/', wrap('query', languageQueryValidation), async (c) => {
		const { language } = c.req.valid('query');

		const result: IMenuLink[] = await db
			.select({
				pageId: menuLinks.pageId,
				text: menuLinks.text,
				parentId: menuLinks.parentId,
				position: menuLinks.position,
				href: sql<string>`${pages.slug}`,
			})
			.from(menuLinks)
			.leftJoin(pages, eq(menuLinks.pageId, pages.id))
			.where(and(eq(pages.language, language), not(eq(pages.slug, ''))));

		return c.json(result);
	})
	.put('/', wrap('json', v.object({ menuLinks: v.array(v.omit(insertMenuLinkSchema, ['text'])) })), async (c) => {
		const input = c.req.valid('json');

		await Promise.all(input.menuLinks.map(({ pageId, position, parentId }) => db
			.update(menuLinks)
			.set({ position, parentId, updatedAt: new Date() })
			.where(eq(menuLinks.pageId, pageId))
		));

		return c.body(null, 204);
	})
	.get('/public', wrap('query', languageQueryValidation), async (c) => {
		const { language } = c.req.valid('query');

		const result = await db
			.select({
				text: menuLinks.text,
				parentId: menuLinks.parentId,
				position: menuLinks.position,
				href: sql<string>`${pages.slug}`,
			})
			.from(menuLinks)
			.leftJoin(pages, eq(menuLinks.pageId, pages.id))
			.where(and(eq(pages.language, language), not(eq(menuLinks.parentId, -1)), not(eq(pages.slug, ''))));

		return c.json(result);
	});
