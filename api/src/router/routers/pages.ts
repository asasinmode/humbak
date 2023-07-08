import { eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/db';
import { insertPageSchema, pages } from '~/db/schema/pages';
import { publicProcedure, router } from '~/router/trpc';

export const pagesRouter = router({
	list: publicProcedure.query(() => {
		return db.select({ id: pages.id, language: pages.language, title: pages.title, menuText: pages.menuText }).from(pages);
	}),
	byId: publicProcedure.input(z.number()).query((opts) => {
		return db.select().from(pages).where(eq(pages.id, opts.input));
	}),
	create: publicProcedure.input(insertPageSchema).mutation(async (opts) => {
		const [{ insertId }] = await db.insert(pages).values(opts.input);

		const page = await db.select().from(pages).where(eq(pages.id, insertId));

		return page[0];
	}),
	uniqueLanguages: publicProcedure.input(z.object({
		query: z.string().optional().default(''),
		limit: z.number().optional().default(5),
		offset: z.number().optional().default(0),
	})).query(async (opts) => {
		const { query, limit, offset } = opts.input;

		const result = await (query
			? db
				.selectDistinct({ language: pages.language })
				.from(pages)
				.where(ilike(pages.language, query))
				.orderBy(pages.language)
				.limit(limit)
				.offset(offset)
			: db
				.selectDistinct({ language: pages.language })
				.from(pages)
				.orderBy(pages.language)
				.limit(limit)
				.offset(offset)
		);

		return result.map(row => row.language);
	}),
});
