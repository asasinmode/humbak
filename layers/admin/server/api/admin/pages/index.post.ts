import fs from 'node:fs/promises';
import { and, eq, isNull, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { insertContentSchema } from '~~/server/db/schema/contents';
import { insertMenuLinkSchema } from '~~/server/db/schema/menuLinks';
import { insertPageSchema } from '~~/server/db/schema/pages';

const upsertPageInputSchema = v.object({
	...insertPageSchema.entries,
	html: insertContentSchema.entries.html,
	meta: insertContentSchema.entries.meta,
	menuText: insertMenuLinkSchema.entries.text,
	css: v.optional(v.string()),
});

export type IUpsertPageInputSchema = v.InferInput<typeof upsertPageInputSchema>;

const { pages, menuLinks, contents, filesToPages } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const { menuText, html, meta, css, ...pageFields } = await useValidatedBody(event, upsertPageInputSchema);

	const originalPage = pageFields.id !== undefined
		? await db.select({ language: pages.language, slug: pages.slug })
			.from(pages)
			.where(eq(pages.id, pageFields.id))
		: undefined;

	let languageChanged = false;
	let slugChanged = false;
	if (originalPage?.[0] !== undefined) {
		languageChanged = originalPage[0].language !== pageFields.language;
		slugChanged = originalPage[0].slug !== pageFields.slug;
	}

	const { value: parsedHtml, fileIds: associatedFilesIds } = await parseHumbakHtml(html, db);

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
		const countResult = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(menuLinks)
			.leftJoin(pages, eq(pages.id, menuLinks.pageId))
			.where(and(isNull(menuLinks.parentId), eq(pages.language, pageFields.language)));

		position = countResult[0]!.count;
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
						: languageChanged || slugChanged
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
			? fs.writeFile(`${stylesheetsStoragePath}/${pageId}.css`, css || '')
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
		fs.readFile(`${stylesheetsStoragePath}/${pageId}.css`),
	]);

	return { ...result!, css: stylesheetFileData.toString() };
});
