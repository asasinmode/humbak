import fs from 'node:fs/promises';
import { eq, sql } from 'drizzle-orm';

const { pages, menuLinks, contents } = tables;

export default defineEventHandler(async (event) => {
	const { id } = useValidatedParams(event, idParamValidation);

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
		fs.readFile(`${stylesheetsStoragePath}/${id}.css`),
	]);

	return { ...result!, css: stylesheetFileData.toString() };
});
