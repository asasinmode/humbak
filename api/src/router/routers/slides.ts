import { eq } from 'drizzle-orm';
import { string } from 'valibot';
import { db } from '~/db';
import { publicProcedure, router } from '~/router/trpc';
import { slides } from '~/db/schema/slides';

export const slidesRouter = router({
	list: publicProcedure.input(string()).query(async (opts) => {
		return db
			.select({
				id: slides.id,
				content: slides.content,
				isHidden: slides.isHidden,
			})
			.from(slides)
			.where(eq(slides.language, opts.input));
	}),
});
