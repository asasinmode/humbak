import { eq } from 'drizzle-orm';
import { insertFooterContentsSchema } from '~~/server/db/schema/footerContents';

const { footerContents } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const input = await useValidatedBody(event, insertFooterContentsSchema);

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

	return result!;
});
