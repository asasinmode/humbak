import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/db';
import { publicProcedure, router } from '~/router/trpc';
import { pages } from '~/db/schema/pages';
import { menuLinks } from '~/db/schema/menuLinks';

export const menuLinksRouter = router({
	list: publicProcedure.input(z.string()).query(async (opts) => {
		return db
			.select({
				id: menuLinks.pageId,
				text: menuLinks.text,
				parentId: menuLinks.parentId,
				position: menuLinks.position,
				href: sql<string>`pages.slug`,
			})
			.from(menuLinks)
			.leftJoin(pages, eq(menuLinks.pageId, pages.id))
			.where(eq(pages.language, opts.input));
	}),
});
