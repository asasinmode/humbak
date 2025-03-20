import { and, eq, isNull, not, or, sql } from 'drizzle-orm';
import * as v from 'valibot';

const { pages, contents, menuLinks } = tables;

export default defineEventHandler(async (event) => {
	const { slug } = useValidatedParams(event, v.object({
		slug: v.string(),
	}));
	const { isLanguage } = useValidatedQuery(event, v.object({
		isLanguage: v.optional(v.string()),
	}));

	const [page] = await db
		.select({ id: pages.id })
		.from(pages)
		.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
		.where(
			isLanguage === 'true'
				? and(eq(pages.language, slug), eq(pages.slug, ''))
				: and(eq(pages.slug, slug), or(not(eq(menuLinks.parentId, -1)), isNull(menuLinks.parentId))),
		);

	if (!page) {
		throw createError({ statusCode: 404, statusMessage: 'Not Found' });
	}

	const [pageData] = await db
		.select({
			id: pages.id,
			title: pages.title,
			slug: pages.slug,
			html: sql<string>`${contents.parsedHtml}`,
			meta: sql<string>`${contents.meta}`,
			createdAt: sql<string>`${pages.createdAt}`,
			updatedAt: sql<string>`${pages.updatedAt}`,
		})
		.from(pages)
		.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
		.leftJoin(contents, eq(contents.pageId, pages.id))
		.where(eq(pages.id, page.id));

	return pageData;
});
