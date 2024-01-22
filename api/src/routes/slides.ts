import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { object } from 'valibot';
import { db } from '../db';
import { idParamValidationMiddleware, languageQueryValidation, nonEmptyMaxLengthString, wrap } from '../helpers';
import { insertSlideSchema, slides } from '../db/schema/slides';
import { slideAspectRatio } from '../db/schema/slideAspectRatio';
import { filesToSlides } from '../db/schema/filesToSlides';
import { parsePageHtml } from '../helpers/pages';

export const app = new Hono()
	.get('/', wrap('query', languageQueryValidation), async (c) => {
		const { language } = c.req.valid('query');

		const result = await db
			.select({
				id: slides.id,
				name: slides.name,
				isHidden: slides.isHidden,
			})
			.from(slides)
			.orderBy(slides.createdAt)
			.where(eq(slides.language, language));

		return c.json(result);
	})
	.post('/', wrap('json', insertSlideSchema), async (c) => {
		const { content, ...input } = c.req.valid('json');

		const { value: parsedContent, fileIds: associatedFilesIds } = await parsePageHtml(content);

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

		return c.json(result);
	})
	.get('/aspectRatio', async (c) => {
		const [result] = await db
			.select({
				value: slideAspectRatio.value,
			})
			.from(slideAspectRatio);

		return c.json(result.value);
	})
	.put('aspectRatio', wrap('json', object({ value: nonEmptyMaxLengthString() })), async (c) => {
		const { value } = c.req.valid('json');
		await db.update(slideAspectRatio).set({ value, updatedAt: new Date() });

		return c.body(null, 204);
	})
	.get('/:id', idParamValidationMiddleware, async (c) => {
		const { id } = c.req.valid('param');

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

		return c.json(result);
	})
	.delete('/:id', idParamValidationMiddleware, async (c) => {
		const { id } = c.req.valid('param');

		await db.delete(slides).where(eq(slides.id, id));

		return c.body(null, 204);
	});
