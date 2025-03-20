import { eq, like, or, sql } from 'drizzle-orm';

const { pages, menuLinks } = tables;

export default defineEventHandler(async (event) => {
	const { query, limit: rawLimit, offset } = useValidatedQuery(event, paginationQueryValidation);
	const limit = Math.min(rawLimit, 100);
	const select = { id: pages.id, language: pages.language, title: pages.title, menuText: menuLinks.text };

	const [items, countResult] = await Promise.all([
		db.select(select)
			.from(pages)
			.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
			.where(query
				? or(
						like(pages.title, `%${query}%`),
						like(menuLinks.text, `%${query}%`),
					)
				: sql`1 = 1`)
			.orderBy(pages.id)
			.limit(limit)
			.offset(offset * limit),
		db.select({ count: sql<number>`COUNT(*)` })
			.from(pages)
			.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
			.where(query
				? or(
						like(pages.title, `%${query}%`),
						like(menuLinks.text, `%${query}%`),
					)
				: sql`1 = 1`),
	]);

	return { items, count: countResult[0]!.count };
});
