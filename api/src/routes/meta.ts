import { eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db';
import { languageExistsMiddleware, languageQueryValidation, wrap } from '../helpers';
import { jwt } from '../helpers/jwt';
import { insertMetaSchema, meta } from '../db/schema/meta';

export const app = new Hono()
	.get(
		'/',
		wrap('query', languageQueryValidation),
		languageExistsMiddleware('query'),
		async (c) => {
			const { language } = c.req.valid('query');

			const [result] = await db
				.select({
					value: sql<string>`${meta.value}`,
				})
				.from(meta)
				.where(eq(meta.language, language));
			type IResult = typeof result;

			if (!result) {
				return c.json({ value: '[]' } as IResult);
			}

			return c.json(result);
		}
	)
	.post('/', jwt, wrap('json', insertMetaSchema), async (c) => {
		const input = c.req.valid('json');

		await db
			.insert(meta)
			.values(input)
			.onDuplicateKeyUpdate({
				set: {
					...input,
					updatedAt: new Date(),
				},
			});

		return c.body(null, 204);
	});
