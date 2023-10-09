import { eq } from 'drizzle-orm';
import { minLength, string } from 'valibot';
import { db } from '~/db';
import { publicProcedure, router } from '~/router/trpc';
import { wrap } from '~/helpers';
import { footerContents, insertFooterContentSchema } from '~/db/schema/footerContents';

export const footerRouter = router({
	byLanguage: publicProcedure.input(wrap(string([minLength(1)]))).query(async (opts) => {
		const [result] = await db
			.select({
				language: footerContents.language,
				emails: footerContents.emails,
				phoneNumbers: footerContents.phoneNumbers,
				location: footerContents.location,
				socials: footerContents.socials,
			})
			.from(footerContents)
			.where(eq(footerContents.language, opts.input));

		return result;
	}),
	upsert: publicProcedure.input(wrap(insertFooterContentSchema)).mutation(async (opts) => {
		await db
			.insert(footerContents)
			.values(opts.input)
			.onDuplicateKeyUpdate({
				set: {
					...opts.input,
					updatedAt: new Date(),
				},
			});

		const [result] = await db
			.select({
				language: footerContents.language,
				emails: footerContents.emails,
				phoneNumbers: footerContents.phoneNumbers,
				location: footerContents.location,
				socials: footerContents.socials,
			})
			.from(footerContents)
			.where(eq(footerContents.language, opts.input.language));

		return result;
	}),
});
