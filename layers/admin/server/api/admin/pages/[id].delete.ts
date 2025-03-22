import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { eq } from 'drizzle-orm';

const { pages, menuLinks } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const { id } = useValidatedParams(event, idParamValidation);

	const [page] = await db.select({
		slug: pages.slug,
		language: pages.language,
	}).from(pages).where(eq(pages.id, id));

	if (!page) {
		setResponseStatus(event, 204, 'No Content');
		return;
	}

	const { defaultLanguage } = useRuntimeConfig().public;
	if (page.slug === '' && page.language === defaultLanguage) {
		setResponseStatus(event, 400, 'Bad Request');
		return `home strona dla języka ${defaultLanguage} nie może być usunięta`;
	}

	await Promise.all([
		db.delete(pages).where(eq(pages.id, id)),
		db
			.update(menuLinks)
			.set({
				parentId: -1,
			})
			.where(eq(menuLinks.parentId, id)),
		existsSync(`${stylesheetsStoragePath}/${id}.css`) && fs.rm(`${stylesheetsStoragePath}/${id}.css`),
	]);

	setResponseStatus(event, 204, 'No Content');
});
