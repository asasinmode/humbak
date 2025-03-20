import { and, eq, not, sql } from 'drizzle-orm';

const { pages, menuLinks } = tables;

export default defineEventHandler(async (event) => {
	const { language } = useValidatedQuery(event, languageQueryValidation);

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

	return result;
});
