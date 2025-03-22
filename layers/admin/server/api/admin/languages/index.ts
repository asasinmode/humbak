import { desc } from 'drizzle-orm';

const { pages } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const result = await db
		.selectDistinct({ language: pages.language })
		.from(pages)
		.orderBy(desc(pages.language));

	return result.map(item => item.language);
});
