import { and, eq, not, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db';
import { languageQueryValidation, wrap } from '../helpers';
import { pages } from '../db/schema/pages';
import { slides } from '../db/schema/slides';
import { menuLinks } from '../db/schema/menuLinks';

export const app = new Hono()
	.get('/menuLinks', wrap('query', languageQueryValidation), async (c) => {
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
	})
	.get('/slides', wrap('query', languageQueryValidation), async (c) => {
		const { language } = c.req.valid('query');

		const result = await db
			.select({
				id: slides.id,
				content: slides.parsedContent,
			})
			.from(slides)
			.orderBy(slides.createdAt)
			.where(and(
				eq(slides.language, language),
				eq(slides.isHidden, false)
			));

		return c.json(result);
	});
