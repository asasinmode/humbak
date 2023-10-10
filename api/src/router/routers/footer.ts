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

		// @ts-expect-error db returns strings but types are correct
		result.emails = JSON.parse(result.emails);
		// @ts-expect-error db returns strings but types are correct
		result.phoneNumbers = JSON.parse(result.phoneNumbers);
		// @ts-expect-error db returns strings but types are correct
		result.location = JSON.parse(result.location);
		// @ts-expect-error db returns strings but types are correct
		result.socials = JSON.parse(result.socials);

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

		// @ts-expect-error db returns strings but types are correct
		result.emails = JSON.parse(result.emails);
		// @ts-expect-error db returns strings but types are correct
		result.phoneNumbers = JSON.parse(result.phoneNumbers);
		// @ts-expect-error db returns strings but types are correct
		result.location = JSON.parse(result.location);
		// @ts-expect-error db returns strings but types are correct
		result.socials = JSON.parse(result.socials);

		return result;
	}),
});
