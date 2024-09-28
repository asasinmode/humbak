import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db';
import { footerContents, insertFooterContentsSchema } from '../db/schema/footerContents';
import { languageQueryValidation, wrap } from '../helpers';
import { languageExistsMiddleware } from '../helpers/db';
import { jwt } from '../helpers/jwt';

export const app = new Hono()
	.get(
		'/',
		wrap('query', languageQueryValidation),
		languageExistsMiddleware('query'),
		async (c) => {
			const { language } = c.req.valid('query');

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
			type IResult = typeof result;

			if (!result) {
				return c.json({ emails: [], phoneNumbers: [], location: { text: '', value: '' }, socials: [] } as unknown as IResult);
			}

			// @ts-expect-error db returns strings but types are correct
			result.emails = JSON.parse(result.emails);
			// @ts-expect-error db returns strings but types are correct
			result.phoneNumbers = JSON.parse(result.phoneNumbers);
			// @ts-expect-error db returns strings but types are correct
			result.location = JSON.parse(result.location);
			// @ts-expect-error db returns strings but types are correct
			result.socials = JSON.parse(result.socials);

			return c.json(result);
		}
	)
	.post('/', jwt, wrap('json', insertFooterContentsSchema), async (c) => {
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

		return c.json(result);
	});
