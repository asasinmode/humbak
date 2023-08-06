import { eq, like, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/db';
import { publicProcedure, router } from '~/router/trpc';
import { paginationQueryInput } from '~/helpers';
import { insertPageSchema, pages } from '~/db/schema/pages';
import { contents, insertContentSchema } from '~/db/schema/contents';
import { insertMenuSchema, menuLinks } from '~/db/schema/menuLinks';

const upsertPageInputSchema = insertPageSchema
	.and(z.object({
		menuText: insertMenuSchema.shape.text,
		css: z.string().optional(),
	}))
	.and(insertContentSchema.omit({ pageId: true }));

export const pagesRouter = router({
	list: publicProcedure.input(paginationQueryInput).query(async (opts) => {
		const { query, limit, offset } = opts.input;
		const select = { id: pages.id, language: pages.language, title: pages.title, menuText: menuLinks.text };

		return db
			.select(select)
			.from(pages)
			.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
			.where(query
				? or(
					like(pages.title, `%${query}%`),
					like(menuLinks.text, `%${query}%`)
				)
				: sql`1 = 1`)
			.orderBy(pages.id)
			.limit(limit)
			.offset(offset * limit);
	}),
	count: publicProcedure.input(paginationQueryInput.pick({ query: true })).query(async (opts) => {
		const { query } = opts.input;

		const result = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(pages)
			.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
			.where(query
				? or(
					like(pages.title, `%${query}%`),
					like(menuLinks.text, `%${query}%`)
				)
				: sql`1 = 1`);

		return result[0].count;
	}),
	byId: publicProcedure.input(z.number()).query(async (opts) => {
		const result = await db
			.select({
				id: pages.id,
				language: pages.language,
				title: pages.title,
				slug: pages.slug,
				menuText: sql<string>`${menuLinks.text}`,
				html: sql<string>`${contents.html}`,
				meta: sql<string>`${contents.meta}`,
			})
			.from(pages)
			.leftJoin(menuLinks, eq(menuLinks.pageId, opts.input))
			.leftJoin(contents, eq(contents.pageId, opts.input))
			.where(eq(pages.id, opts.input));

		return result[0];
	}),
	upsert: publicProcedure.input(upsertPageInputSchema).mutation(async (opts) => {
		const { menuText, html, meta, css, ...pageFields } = opts.input;

		const [{ insertId: pageId }] = await db
			.insert(pages)
			.values(pageFields)
			.onDuplicateKeyUpdate({
				set: {
					...pageFields,
					id: undefined,
					updatedAt: new Date(),
				},
			});

		await Promise.all([
			db.insert(menuLinks).values({ pageId, text: menuText }).onDuplicateKeyUpdate({
				set: {
					text: menuText,
					updatedAt: new Date(),
				},
			}),
			db.insert(contents).values({ pageId, html, meta }).onDuplicateKeyUpdate({
				set: {
					html,
					meta,
					updatedAt: new Date(),
				},
			}),
		]);

		const result = await db
			.select({
				id: pages.id,
				language: pages.language,
				title: pages.title,
				slug: pages.slug,
				menuText: sql<string>`${menuLinks.text}`,
				html: sql<string>`${contents.html}`,
				meta: sql<string>`${contents.meta}`,
			})
			.from(pages)
			.leftJoin(menuLinks, eq(menuLinks.pageId, pageId))
			.leftJoin(contents, eq(contents.pageId, pageId))
			.where(eq(pages.id, pageId));

		return result[0];
	}),
	delete: publicProcedure.input(z.number()).mutation(async (opts) => {
		await db.delete(pages).where(eq(pages.id, opts.input));
	}),
	uniqueLanguages: publicProcedure.query(async () => {
		const result = await db.selectDistinct({ language: pages.language }).from(pages);

		return result.map(row => row.language);
	}),
});
