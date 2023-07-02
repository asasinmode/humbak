import { db } from '~/db';
import { pages } from '~/db/schema/pages';
import { publicProcedure, router } from '~/router/trpc';

export const pagesRouter = router({
	list: publicProcedure.query(async () => {
		const result = await db.select().from(pages);

		return result;
	}),
});
