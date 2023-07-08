import { eq } from 'drizzle-orm';
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
	uniqueLanguages: publicProcedure.query(() => {
		return db.selectDistinct({ language: pages.language }).from(pages).orderBy(pages.language);
	}),
});
