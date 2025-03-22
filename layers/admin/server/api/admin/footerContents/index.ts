import { eq } from 'drizzle-orm';

const { footerContents } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const { language } = useValidatedQuery(event, languageQueryValidation);

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

	type IResult = NonNullable<typeof result>;
	if (!result) {
		return { emails: [], phoneNumbers: [], location: { text: '', value: '' }, socials: [] } as unknown as IResult;
	}

	// @ts-expect-error db returns strings but types are correct
	result.emails = JSON.parse(result.emails);
	// @ts-expect-error db returns strings but types are correct
	result.phoneNumbers = JSON.parse(result.phoneNumbers);
	// @ts-expect-error db returns strings but types are correct
	result.location = JSON.parse(result.location);
	// @ts-expect-error db returns strings but types are correct
	result.socials = JSON.parse(result.socials);

	return result!;
});
