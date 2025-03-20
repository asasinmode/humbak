import { eq } from 'drizzle-orm';

const { slides } = tables;

export default defineEventHandler(async (event) => {
	const { id } = useValidatedParams(event, idParamValidation);

	await db.delete(slides).where(eq(slides.id, id));

	setResponseStatus(event, 204, 'No Content');
});
