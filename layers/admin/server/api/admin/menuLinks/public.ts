import { and, eq, not, sql } from 'drizzle-orm';

const { menuLinks, pages } = tables;

export default defineEventHandler(async (event) => {
	const { language } = useValidatedQuery(event, languageQueryValidation);

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

	return result;
});
