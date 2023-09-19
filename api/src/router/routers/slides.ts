import { eq } from 'drizzle-orm';
import { integer, number, string } from 'valibot';
import { db } from '~/db';
import { publicProcedure, router } from '~/router/trpc';
import { slides } from '~/db/schema/slides';

export const slidesRouter = router({
	list: publicProcedure.input(string()).query(async (opts) => {
		return db
			.select({
				id: slides.id,
				name: slides.name,
			})
			.from(slides)
			.orderBy(slides.createdAt)
			.where(eq(slides.language, opts.input));
	}),
	byId: publicProcedure.input(number([integer()])).query(async (opts) => {
		const [result] = await db
			.select({
				id: slides.id,
				name: slides.name,
				content: slides.content,
				isHidden: slides.isHidden,
			})
			.from(slides)
			.where(eq(slides.id, opts.input));

		return result;
	}),
});
