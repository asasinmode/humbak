import type { MiddlewareHandler } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { pages } from '../db/schema/pages';

export function languageExistsMiddleware(location: 'query' | 'param'): MiddlewareHandler {
	return async (c, next) => {
		const { language } = (c.req as any).valid(location);

		const [languageResult] = await db
			.selectDistinct({ language: pages.language })
			.from(pages)
			.where(eq(pages.language, language))
			.limit(1);
		if (!languageResult) {
			return c.notFound();
		}

		await next();
	};
}
