import { eq, sql } from 'drizzle-orm';
import { array, omit, string } from 'valibot';
import { db } from '~/db';
import { publicProcedure, router } from '~/router/trpc';
import { pages } from '~/db/schema/pages';
import { insertMenuLinkSchema, menuLinks } from '~/db/schema/menuLinks';
import { valibotSchemaToTRPCInput } from '~/helpers';

export const menuLinksRouter = router({
	list: publicProcedure.input(string()).query(async (opts) => {
		return db
			.select({
				pageId: menuLinks.pageId,
				text: menuLinks.text,
				parentId: menuLinks.parentId,
				position: menuLinks.position,
				href: sql<string>`pages.slug`,
			})
			.from(menuLinks)
			.leftJoin(pages, eq(menuLinks.pageId, pages.id))
			.where(eq(pages.language, opts.input));
	}),
	update: publicProcedure.input(valibotSchemaToTRPCInput(array(omit(insertMenuLinkSchema, ['text'])))).mutation(async (opts) => {
		await Promise.all(opts.input.map(({ pageId, position, parentId }) => db
			.update(menuLinks)
			.set({ position, parentId, updatedAt: new Date() })
			.where(eq(menuLinks.pageId, pageId))
		));
	}),
});
