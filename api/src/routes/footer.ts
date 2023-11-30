import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '~/db';
import { languageParamValidation, wrap } from '~/helpers';
import { footerContents, insertFooterContentSchema } from '~/db/schema/footerContents';

export const app = new Hono()
	.get('/:language', wrap(languageParamValidation, 'param'), async (c) => {
		const { language } = c.req.valid('param');

		const [result] = await db
			.select({
				language: footerContents.language,
				emails: footerContents.emails,
				phoneNumbers: footerContents.phoneNumbers,
				location: footerContents.location,
				socials: footerContents.socials,
			})
			.from(footerContents)
			.where(eq(footerContents.language, language));

		if (!result) {
			return c.notFound();
		}

		// @ts-expect-error db returns strings but types are correct
		result.emails = JSON.parse(result.emails);
		// @ts-expect-error db returns strings but types are correct
		result.phoneNumbers = JSON.parse(result.phoneNumbers);
		// @ts-expect-error db returns strings but types are correct
		result.location = JSON.parse(result.location);
		// @ts-expect-error db returns strings but types are correct
		result.socials = JSON.parse(result.socials);

		return c.jsonT(result);
	})
	.post('/', wrap(insertFooterContentSchema, 'json'), async (c) => {
		const input = c.req.valid('json');

		await db
			.insert(footerContents)
			.values(input)
			.onDuplicateKeyUpdate({
				set: {
					...input,
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
			.where(eq(footerContents.language, input.language));

		if (result) {
			// @ts-expect-error db returns strings but types are correct
			result.emails = JSON.parse(result.emails);
			// @ts-expect-error db returns strings but types are correct
			result.phoneNumbers = JSON.parse(result.phoneNumbers);
			// @ts-expect-error db returns strings but types are correct
			result.location = JSON.parse(result.location);
			// @ts-expect-error db returns strings but types are correct
			result.socials = JSON.parse(result.socials);
		}

		return c.jsonT(result);
	});
