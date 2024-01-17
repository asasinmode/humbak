import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db';
import { languageQueryValidation, wrap } from '../helpers';
import { jwt } from '../helpers/jwt';
import { pages } from '../db/schema/pages';
import { footerContents, insertFooterContentSchema } from '../db/schema/footerContents';

export const app = new Hono<{
	Variables: {
		language: string;
	};
}>()
	.get(
		'/',
		wrap('query', languageQueryValidation),
		async (c, next) => {
			const { language } = c.req.valid('query');

			const [languageResult] = await db.selectDistinct({ language: pages.language }).from(pages).where(eq(pages.language, language));
			if (!languageResult) {
				return c.notFound();
			}

			c.set('language', language);
			await next();
		},
		async (c) => {
			const language = c.get('language');

			const [result] = await db
				.select({
					language: footerContents.language,
					emails: footerContents.emails,
					phoneNumbers: footerContents.phoneNumbers,
					location: footerContents.location,
					socials: footerContents.socials,
				})
				.from(footerContents)
				.where(language ? eq(footerContents.language, language) : undefined);
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
	.post('/', jwt, wrap('json', insertFooterContentSchema), async (c) => {
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
