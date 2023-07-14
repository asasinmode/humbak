import { eq, like, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/db';
import { insertPageSchema, pages } from '~/db/schema/pages';
import { publicProcedure, router } from '~/router/trpc';
import { paginationQueryInput } from '~/helpers';

export const pagesRouter = router({
	list: publicProcedure.input(paginationQueryInput).query(async (opts) => {
		const { query, limit, offset } = opts.input;
		const select = { id: pages.id, language: pages.language, title: pages.title, menuText: pages.menuText };

		return db
			.selectDistinct(select)
			.from(pages)
			.where(query
				? or(
					like(pages.title, query),
					like(pages.menuText, query)
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
			.where(query
				? or(
					like(pages.title, query),
					like(pages.menuText, query)
				)
				: sql`1 = 1`);

		return result[0].count;
	}),
	byId: publicProcedure.input(z.number()).query((opts) => {
		return db.select().from(pages).where(eq(pages.id, opts.input));
	}),
	create: publicProcedure.input(insertPageSchema).mutation(async (opts) => {
		const [{ insertId }] = await db.insert(pages).values(opts.input);

		const page = await db.select().from(pages).where(eq(pages.id, insertId));

		return page[0];
	}),
	uniqueLanguages: publicProcedure.query(async () => {
		const result = await db.selectDistinct({ language: pages.language }).from(pages);

		return result.map(row => row.language);
	}),
});
