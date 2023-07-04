import { db } from '~/db';
import { insertPageSchema, pages } from '~/db/schema/pages';
import { publicProcedure, router } from '~/router/trpc';

export const pagesRouter = router({
	list: publicProcedure.query(async () => {
		const result = await db.select().from(pages);

		return result;
	}),
	create: publicProcedure.input(insertPageSchema).mutation((opts) => {
		const { input } = opts;

		console.log('creating', input, input.language.length);
	}),
});
