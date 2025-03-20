import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { insertMenuLinkSchema } from '~~/server/db/schema/menuLinks';

const { menuLinks } = tables;

export default defineEventHandler(async (event) => {
	const input = await useValidatedBody(event, v.object({
		menuLinks: v.array(v.omit(insertMenuLinkSchema, ['text'])),
	}));

	await Promise.all(input.menuLinks.map(({ pageId, position, parentId }) => db
		.update(menuLinks)
		.set({ position, parentId, updatedAt: new Date() })
		.where(eq(menuLinks.pageId, pageId)),
	));

	setResponseStatus(event, 204, 'No Content');
});
