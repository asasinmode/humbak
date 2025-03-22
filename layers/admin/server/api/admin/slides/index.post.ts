import { eq } from 'drizzle-orm';
import { insertSlideSchema } from '~~/server/db/schema/slides';

const { slides, filesToSlides } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const { content, ...input } = await useValidatedBody(event, insertSlideSchema);

	const { value: parsedContent, fileIds: associatedFilesIds } = await parseHumbakHtml(content, db);

	const [{ insertId: slideId }] = await db
		.insert(slides)
		.values({
			...input,
			rawContent: content,
			parsedContent,
		})
		.onDuplicateKeyUpdate({
			set: {
				...input,
				rawContent: content,
				parsedContent,
				id: undefined,
				updatedAt: new Date(),
			},
		});

	await db.delete(filesToSlides).where(eq(filesToSlides.slideId, slideId));
	if (associatedFilesIds.length) {
		await db.insert(filesToSlides).values(associatedFilesIds.map(fileId => ({ slideId, fileId })));
	}

	const [result] = await db
		.select({
			id: slides.id,
			name: slides.name,
			content: slides.rawContent,
			isHidden: slides.isHidden,
			language: slides.language,
		})
		.from(slides)
		.where(eq(slides.id, slideId));

	return result!;
});
