import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { object } from 'valibot';
import { db } from '../db';
import { idParamValidation, languageQueryValidation, nonEmptyMaxLengthString, wrap } from '../helpers';
import { insertSlideSchema, slides } from '../db/schema/slides';
import { slideAspectRatio } from '../db/schema/slideAspectRatio';

export const app = new Hono()
	.get('/', wrap(languageQueryValidation, 'query'), async (c) => {
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

		return c.jsonT(result);
	})
	.get('/public', wrap(languageQueryValidation, 'query'), async (c) => {
		const { language } = c.req.valid('query');

		const result = await db
			.select({
				id: slides.id,
				content: slides.content,
			})
			.from(slides)
			.orderBy(slides.createdAt)
			.where(and(
				eq(slides.language, language),
				eq(slides.isHidden, false)
			));

		return c.jsonT(result);
	})
	.get('/:id', wrap(idParamValidation, 'param'), async (c) => {
		const { id } = c.req.valid('param');

		const [result] = await db
			.select({
				id: slides.id,
				name: slides.name,
				content: slides.content,
				isHidden: slides.isHidden,
				language: slides.language,
			})
			.from(slides)
			.where(eq(slides.id, id));

		return c.jsonT(result);
	})
	.post('/', wrap(insertSlideSchema, 'json'), async (c) => {
		const input = c.req.valid('json');

		const [{ insertId: slideId }] = await db
			.insert(slides)
			.values(input)
			.onDuplicateKeyUpdate({
				set: {
					...input,
					id: undefined,
					updatedAt: new Date(),
				},
			});

		const [result] = await db
			.select({
				id: slides.id,
				name: slides.name,
				content: slides.content,
				isHidden: slides.isHidden,
				language: slides.language,
			})
			.from(slides)
			.where(eq(slides.id, slideId));

		return c.jsonT(result);
	})
	.delete('/:id', wrap(idParamValidation, 'query'), async (c) => {
		const { id } = c.req.valid('query');

		await db.delete(slides).where(eq(slides.id, id));

		return c.text('', 201);
	})
	.get('/aspectRatio', async (c) => {
		const [result] = await db
			.select({
				value: slideAspectRatio.value,
			})
			.from(slideAspectRatio);

		return c.jsonT(result.value);
	})
	.put('aspectRatio', wrap(object({ value: nonEmptyMaxLengthString() }), 'json'), async (c) => {
		const { value } = c.req.valid('json');
		await db.update(slideAspectRatio).set({ value, updatedAt: new Date() });

		return c.text('', 201);
	});

export type AppType = typeof app;
