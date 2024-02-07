import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { and, eq, isNull, like, or, sql } from 'drizzle-orm';
import { merge, object, optional, pick, string } from 'valibot';
import { stylesheetsStoragePath } from '../helpers/files';
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
			readFile(`${stylesheetsStoragePath}/${id}.css`),
		]);

		return c.json({ ...result, css: stylesheetFileData.toString() });
	})
	.post('/', wrap('json', upsertPageInputSchema), async (c) => {
		const { menuText, html, meta, css, ...pageFields } = c.req.valid('json');

		const originalPage = pageFields.id !== undefined
			? await db.select({ language: pages.language, slug: pages.slug })
				.from(pages).where(eq(pages.id, pageFields.id))
			: undefined;

		let languageChanged = false;
		let slugChanged = false;
		if (originalPage?.[0] !== undefined) {
			languageChanged = originalPage[0].language !== pageFields.language;
			slugChanged = originalPage[0].slug !== pageFields.slug;
		}

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

		const isHomePage = !pageFields.slug;
		const isNew = pageFields.id === undefined;
		let position: number;

		if (isNew) {
			position = 0;
		} else {
			const [{ count }] = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(menuLinks)
				.leftJoin(pages, eq(pages.id, menuLinks.pageId))
				.where(and(isNull(menuLinks.parentId), eq(pages.language, pageFields.language)));

			position = count;
		}

		await Promise.all([
			db.insert(menuLinks)
				.values({
					pageId,
					position,
					text: menuText,
					parentId: isHomePage ? null : -1,
				})
				.onDuplicateKeyUpdate({
					set: {
						text: menuText,
						parentId: isHomePage
							? null
							: languageChanged || (!isHomePage && slugChanged)
								? -1
								: undefined,
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
				? writeFile(`${stylesheetsStoragePath}/${pageId}.css`, css || '')
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
			readFile(`${stylesheetsStoragePath}/${pageId}.css`),
		]);

		return c.json({ ...result, css: stylesheetFileData.toString() });
	})
	.delete('/:id', idParamValidationMiddleware, async (c) => {
		const { id } = c.req.valid('param');

		const [page] = await db.select({
			slug: pages.slug,
			language: pages.language,
		}).from(pages).where(eq(pages.id, id));

		if (!page) {
			return c.body(null, 204);
		}
		if (page.slug === '' && page.language === 'pl') {
			return c.text('home strona dla języka pl nie może być usunięta', 400);
		}

		await Promise.all([
			db.delete(pages).where(eq(pages.id, id)),
			db
				.update(menuLinks)
				.set({
					parentId: -1,
				})
				.where(eq(menuLinks.parentId, id)),
			existsSync(`${stylesheetsStoragePath}/${id}.css`) && rm(`${stylesheetsStoragePath}/${id}.css`),
		]);

		return c.body(null, 204);
	});
