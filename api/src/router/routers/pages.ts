import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { eq, isNull, like, or, sql } from 'drizzle-orm';
import { integer, merge, number, object, optional, pick, string } from 'valibot';
import { db } from '~/db';
import { publicProcedure, router } from '~/router/trpc';
import { paginationQueryInput, wrap } from '~/helpers';
import { insertPageSchema, pages } from '~/db/schema/pages';
import { contents, insertContentSchema } from '~/db/schema/contents';
import { insertMenuLinkSchema, menuLinks } from '~/db/schema/menuLinks';

const upsertPageInputSchema = merge([
	insertPageSchema,
	object({ menuText: insertMenuLinkSchema.entries.text, css: optional(string()) }),
	pick(insertContentSchema, ['html', 'meta']),
]);

export const pagesRouter = router({
	list: publicProcedure.input(wrap(paginationQueryInput)).query(async (opts) => {
		const { query, limit: rawLimit, offset } = opts.input;
		const limit = Math.min(rawLimit, 100);
		const select = { id: pages.id, language: pages.language, title: pages.title, menuText: menuLinks.text };

		return db
			.select(select)
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
			.offset(offset * limit);
	}),
	count: publicProcedure.input(wrap(optional(paginationQueryInput.entries.query, ''))).query(async (opts) => {
		const result = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(pages)
			.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
			.where(opts.input
				? or(
					like(pages.title, `%${opts.input}%`),
					like(menuLinks.text, `%${opts.input}%`)
				)
				: sql`1 = 1`);

		return result[0].count;
	}),
	byId: publicProcedure.input(wrap(number([integer()]))).query(async (opts) => {
		const [[result], stylesheetFileData] = await Promise.all([
			db
				.select({
					id: pages.id,
					language: pages.language,
					title: pages.title,
					slug: pages.slug,
					menuText: sql<string>`${menuLinks.text}`,
					html: sql<string>`${contents.html}`,
					meta: sql<string>`${contents.meta}`,
				})
				.from(pages)
				.leftJoin(menuLinks, eq(menuLinks.pageId, opts.input))
				.leftJoin(contents, eq(contents.pageId, opts.input))
				.where(eq(pages.id, opts.input)),
			readFile(fileURLToPath(new URL(`../../../public/stylesheets/${opts.input}.css`, import.meta.url))),
		]);

		return { ...result, css: stylesheetFileData.toString() };
	}),
	upsert: publicProcedure.input(wrap(upsertPageInputSchema)).mutation(async (opts) => {
		const { menuText, html, meta, css, ...pageFields } = opts.input;

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
			db.insert(contents).values({ pageId, html, meta }).onDuplicateKeyUpdate({
				set: {
					html,
					meta,
					updatedAt: new Date(),
				},
			}),
			css !== undefined || opts.input.id === undefined
				? writeFile(fileURLToPath(new URL(`../../../public/stylesheets/${pageId}.css`, import.meta.url)), css || '')
				: () => {},
		]);

		const [[result], stylesheetFileData] = await Promise.all([
			db
				.select({
					id: pages.id,
					language: pages.language,
					title: pages.title,
					slug: pages.slug,
					menuText: sql<string>`${menuLinks.text}`,
					html: sql<string>`${contents.html}`,
					meta: sql<string>`${contents.meta}`,
				})
				.from(pages)
				.leftJoin(menuLinks, eq(menuLinks.pageId, pageId))
				.leftJoin(contents, eq(contents.pageId, pageId))
				.where(eq(pages.id, pageId)),
			readFile(fileURLToPath(new URL(`../../../public/stylesheets/${pageId}.css`, import.meta.url))),
		]);

		return { ...result, css: stylesheetFileData.toString() };
	}),
	delete: publicProcedure.input(wrap(number([integer()]))).mutation(async (opts) => {
		await db.delete(pages).where(eq(pages.id, opts.input));
	}),
	uniqueLanguages: publicProcedure.query(async () => {
		const result = await db.selectDistinct({ language: pages.language }).from(pages).orderBy(pages.createdAt);

		return result.map(row => row.language);
	}),
	updateGlobalCss: publicProcedure.input(wrap(string())).mutation(async (opts) => {
		await writeFile(fileURLToPath(new URL('../../../public/stylesheets/global.css', import.meta.url)), opts.input);
	}),
});
