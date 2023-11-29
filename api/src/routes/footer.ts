import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { minLength, string } from 'valibot';
import { db } from '~/db';
import { wrap } from '~/helpers';
import { footerContents, insertFooterContentSchema } from '~/db/schema/footerContents';

export const app = new Hono();

const validation = wrap(string([minLength(1)]));

app.get('/:language', async (c) => {
	const language = c.req.param('language');

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

const postValidation = wrap(insertFooterContentSchema);

app.post('/', async (c) => {
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
