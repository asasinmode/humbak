import { and, desc, eq, isNull, not, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { custom, object, optional, string, transform } from 'valibot';
import { footerContents } from 'src/db/schema/footerContents';
import { db } from '../db';
import { languageExistsMiddleware, wrap } from '../helpers';
import { pages } from '../db/schema/pages';
import { slides } from '../db/schema/slides';
import { menuLinks } from '../db/schema/menuLinks';
import { contents } from '../db/schema/contents';

export const app = new Hono()
	.get('/languages', async (c) => {
		const result = await db
			.selectDistinct({ language: pages.language })
			.from(pages)
			.leftJoin(menuLinks, eq(pages.id, menuLinks.pageId))
			.where(or(not(eq(menuLinks.parentId, -1)), isNull(menuLinks.parentId)))
			.orderBy(desc(pages.language));

		return c.json(result.map(item => item.language));
	})
	.get(
		'/pages/:slug',
		wrap('param', object({
			slug: string(),
		})),
		wrap('query', object({
			isLanguage: optional(string()),
		})),
		async (c) => {
			const { slug } = c.req.valid('param');
			const isLanguage = c.req.valid('query').isLanguage === 'true';

			const [page] = await db
				.select({ id: pages.id })
				.from(pages)
				.where(
					isLanguage ? and(eq(pages.language, slug), eq(pages.slug, '')) : eq(pages.slug, slug)
				);
			if (!page) {
				return c.notFound();
			}

			const [pageData] = await db
				.select({
					id: pages.id,
					title: pages.title,
					slug: pages.slug,
					html: sql<string>`${contents.rawHtml}`,
					meta: sql<string>`${contents.meta}`,
				})
				.from(pages)
				.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
				.leftJoin(contents, eq(contents.pageId, pages.id))
				.where(eq(pages.id, page.id));

			return c.json(pageData);
		}
	)
	.get(
		'/:language',
		wrap('param', object({ language: string() })),
		languageExistsMiddleware('param'),
		async (c) => {
			const { language } = c.req.valid('param');

			const [menuLinksResult, slidesResult, [footerContentsResult]] = await Promise.all([
				db.select({
					text: menuLinks.text,
					parentId: menuLinks.parentId,
					position: menuLinks.position,
					href: sql<string>`${pages.slug}`,
				})
					.from(menuLinks)
					.leftJoin(pages, eq(menuLinks.pageId, pages.id))
					.where(and(eq(pages.language, language), not(eq(menuLinks.parentId, -1)), not(eq(pages.slug, '')))),
				db.select({
					id: slides.id,
					content: slides.parsedContent,
				})
					.from(slides)
					.orderBy(slides.createdAt)
					.where(and(
						eq(slides.language, language),
						eq(slides.isHidden, false)
					)),
				db.select({
					emails: footerContents.emails,
					phoneNumbers: footerContents.phoneNumbers,
					location: footerContents.location,
					socials: footerContents.socials,
				})
					.from(footerContents)
					.where(eq(footerContents.language, language)),
			]);

			return c.json({
				menuLinks: menuLinksResult,
				slides: slidesResult,
				footerContents: footerContentsResult,
			});
		}
	);