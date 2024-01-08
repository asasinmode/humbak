import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { eq, isNull, like, or, sql } from 'drizzle-orm';
import { merge, object, optional, pick, string } from 'valibot';
import { adminStylesheetsPath } from '../helpers/files';
import { idParamValidationMiddleware, paginationQueryValidation, wrap } from '../helpers';
import { db } from '../db';
import { parsePageHtml } from '../helpers/pages';
import { filesToPages } from '../db/schema/filesToPages';
import { insertPageSchema, pages } from '../db/schema/pages';
import { contents, insertContentSchema } from '../db/schema/contents';
import { insertMenuLinkSchema, menuLinks } from '../db/schema/menuLinks';

const upsertPageInputSchema = merge([
	insertPageSchema,
	object({ menuText: insertMenuLinkSchema.entries.text, css: optional(string()) }),
	pick(insertContentSchema, ['html', 'meta']),
]);

export const app = new Hono()
	.get('/', wrap('query', paginationQueryValidation), async (c) => {
		const { query, limit: rawLimit, offset } = c.req.valid('query');
		const limit = Math.min(rawLimit, 100);
		const select = { id: pages.id, language: pages.language, title: pages.title, menuText: menuLinks.text };

		const [items, [{ count }]] = await Promise.all([
			db.select(select)
				.from(pages)
				.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
				.where(query
					? or(
						like(pages.title, `%${query}%`),
						like(menuLinks.text, `%${query}%`)
					)
					: sql`1 = 1`)
				.orderBy(pages.id)
				.limit(limit)
				.offset(offset * limit),
			db.select({ count: sql<number>`COUNT(*)` })
				.from(pages)
				.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
				.where(query
					? or(
						like(pages.title, `%${query}%`),
						like(menuLinks.text, `%${query}%`)
					)
					: sql`1 = 1`),
		]);

		return c.json({ items, count });
	})
	.get('/:id', idParamValidationMiddleware, async (c) => {
		const { id } = c.req.valid('param');

		const [[result], stylesheetFileData] = await Promise.all([
			db
				.select({
					id: pages.id,
					language: pages.language,
					title: pages.title,
					slug: pages.slug,
					menuText: sql<string>`${menuLinks.text}`,
					html: sql<string>`${contents.rawHtml}`,
					meta: sql<string>`${contents.meta}`,
				})
				.from(pages)
				.leftJoin(menuLinks, eq(menuLinks.pageId, id))
				.leftJoin(contents, eq(contents.pageId, id))
				.where(eq(pages.id, id)),
			readFile(`${adminStylesheetsPath}/${id}.css`),
		]);

		return c.json({ ...result, css: stylesheetFileData.toString() });
	})
	.post('/', wrap('json', upsertPageInputSchema), async (c) => {
		const { menuText, html, meta, css, ...pageFields } = c.req.valid('json');

		const { value: parsedHtml, fileIds: associatedFilesIds } = await parsePageHtml(html);

		const [{ insertId: pageId }] = await db
			.insert(pages)
			.values(pageFields)
			.onDuplicateKeyUpdate({
				set: {
					...pageFields,
					id: undefined,
					updatedAt: new Date(),
				},
			});

		const [{ count: position }] = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(menuLinks)
			.where(isNull(menuLinks.parentId));

		await Promise.all([
			db.insert(menuLinks).values({ pageId, position, text: menuText }).onDuplicateKeyUpdate({
				set: {
					text: menuText,
					updatedAt: new Date(),
				},
			}),
			db.insert(contents).values({ pageId, rawHtml: html, parsedHtml, meta }).onDuplicateKeyUpdate({
				set: {
					rawHtml: html,
					parsedHtml,
					meta,
					updatedAt: new Date(),
				},
			}),
			css !== undefined || pageFields.id === undefined
				? writeFile(`${adminStylesheetsPath}/${pageId}.css`, css || '')
				: () => {},
		]);

		await db.delete(filesToPages).where(eq(filesToPages.pageId, pageId));
		if (associatedFilesIds.length) {
			await db.insert(filesToPages).values(associatedFilesIds.map(fileId => ({ pageId, fileId })));
		}

		const [[result], stylesheetFileData] = await Promise.all([
			db
				.select({
					id: pages.id,
					language: pages.language,
					title: pages.title,
					slug: pages.slug,
					menuText: sql<string>`${menuLinks.text}`,
					html: sql<string>`${contents.rawHtml}`,
					meta: sql<string>`${contents.meta}`,
				})
				.from(pages)
				.leftJoin(menuLinks, eq(menuLinks.pageId, pageId))
				.leftJoin(contents, eq(contents.pageId, pageId))
				.where(eq(pages.id, pageId)),
			readFile(`${adminStylesheetsPath}/${pageId}.css`),
		]);

		return c.json({ ...result, css: stylesheetFileData.toString() });
	})
	.delete('/:id', idParamValidationMiddleware, async (c) => {
		const { id } = c.req.valid('param');

		await Promise.all([
			db.delete(pages).where(eq(pages.id, id)),
			db
				.update(menuLinks)
				.set({
					parentId: -1,
				})
				.where(eq(menuLinks.parentId, id)),
			existsSync(`${adminStylesheetsPath}/${id}.css`) && rm(`${adminStylesheetsPath}/${id}.css`),
		]);

		return c.body(null, 204);
	});
