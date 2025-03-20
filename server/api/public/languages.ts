import { desc, eq, isNull, not, or } from 'drizzle-orm';

const { menuLinks, pages } = tables;

export default defineEventHandler(async () => {
	const result = await db
		.selectDistinct({ language: pages.language })
		.from(pages)
		.leftJoin(menuLinks, eq(pages.id, menuLinks.pageId))
		.where(or(not(eq(menuLinks.parentId, -1)), isNull(menuLinks.parentId)))
		.orderBy(desc(pages.language));

	return result.map(item => item.language);
});
