import { eq } from 'drizzle-orm';
import { integer, number, string } from 'valibot';
import { db } from '~/db';
import { publicProcedure, router } from '~/router/trpc';
import { insertSlideSchema, slides } from '~/db/schema/slides';
import { valibotSchemaToTRPCInput } from '~/helpers';

export const slidesRouter = router({
	list: publicProcedure.input(string()).query(async (opts) => {
		return db
			.select({
				id: slides.id,
				name: slides.name,
				isHidden: slides.isHidden,
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
				language: slides.language,
			})
			.from(slides)
			.where(eq(slides.id, opts.input));

		return result;
	}),
	upsert: publicProcedure.input(valibotSchemaToTRPCInput(insertSlideSchema)).mutation(async (opts) => {
		const [{ insertId: slideId }] = await db
			.insert(slides)
			.values(opts.input)
			.onDuplicateKeyUpdate({
				set: {
					...insertSlideSchema,
					id: undefined,
					updatedAt: new Date(),
				},
			});

		const [result] = await db
			.select({
				id: slides.id,
				name: slides.name,
				content: slides.content,
				isHidden: slides.isHidden,
				language: slides.language,
			})
			.from(slides)
			.where(eq(slides.id, slideId));

		return result;
	}),
});
