import { eq } from 'drizzle-orm';

const { slides } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const { id } = useValidatedParams(event, idParamValidation);

	const [result] = await db
		.select({
			id: slides.id,
			name: slides.name,
			content: slides.rawContent,
			isHidden: slides.isHidden,
			language: slides.language,
		})
		.from(slides)
		.where(eq(slides.id, id));

	return result!;
});
