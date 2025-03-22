import { eq, sql } from 'drizzle-orm';

const { meta } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const { language } = useValidatedQuery(event, languageQueryValidation);

	const [result] = await db
		.select({
			value: sql<string>`${meta.value}`,
		})
		.from(meta)
		.where(eq(meta.language, language));

	type IResult = NonNullable<typeof result>;
	if (!result) {
		return { value: '[]' } as IResult;
	}

	return result;
});
