import { eq } from 'drizzle-orm';

const { slides } = tables;

export default defineEventHandler(async (event) => {
	const { language } = useValidatedQuery(event, languageQueryValidation);

	const result = await db
		.select({
			id: slides.id,
			name: slides.name,
			isHidden: slides.isHidden,
		})
		.from(slides)
		.orderBy(slides.createdAt)
		.where(eq(slides.language, language));

	return result;
});
