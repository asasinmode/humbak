import { and, eq } from 'drizzle-orm';

const { slides } = tables;

export default defineEventHandler(async (event) => {
	const { language } = useValidatedQuery(event, languageQueryValidation);

	const result = await db
		.select({
			id: slides.id,
			content: slides.parsedContent,
		})
		.from(slides)
		.orderBy(slides.createdAt)
		.where(and(
			eq(slides.language, language),
			eq(slides.isHidden, false),
		));

	return result;
});
