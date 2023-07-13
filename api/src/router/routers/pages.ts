import { eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/db';
import { insertPageSchema, pages } from '~/db/schema/pages';
import { publicProcedure, router } from '~/router/trpc';
import { paginationQueryInput } from '~/helpers';

export const pagesRouter = router({
	list: publicProcedure.input(paginationQueryInput).query(async (opts) => {
		const { query, limit, offset } = opts.input;
		const select = { id: pages.id, language: pages.language, title: pages.title, menuText: pages.menuText };

		const result = await (query
			? db
				.selectDistinct(select)
				.from(pages)
				.where(ilike(pages.language, query))
				.orderBy(pages.language)
				.limit(limit)
				.offset(offset)
			: db
				.selectDistinct(select)
				.from(pages)
				.orderBy(pages.language)
				.limit(limit)
				.offset(offset)
		);

		return result;
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
