import { and, desc, eq, isNull, not, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { footerContents } from 'src/db/schema/footerContents';
import * as v from 'valibot';
import { db } from '../db';
import { contents } from '../db/schema/contents';
import { menuLinks } from '../db/schema/menuLinks';
import { meta } from '../db/schema/meta';
import { pages } from '../db/schema/pages';
import { slideAspectRatio } from '../db/schema/slideAspectRatio';
import { slides } from '../db/schema/slides';
import { nonEmptyStringValidation, wrap } from '../helpers';
import { languageExistsMiddleware } from '../helpers/db';

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
		wrap('param', v.object({
			slug: v.string(),
		})),
		wrap('query', v.object({
			isLanguage: v.optional(v.string()),
		})),
		async (c) => {
			const { slug } = c.req.valid('param');
			const isLanguage = c.req.valid('query').isLanguage === 'true';

			const [page] = await db
				.select({ id: pages.id })
				.from(pages)
				.leftJoin(menuLinks, eq(menuLinks.pageId, pages.id))
				.where(
					isLanguage
						? and(eq(pages.language, slug), eq(pages.slug, ''))
						: and(eq(pages.slug, slug), or(not(eq(menuLinks.parentId, -1)), isNull(menuLinks.parentId)))
				);
			if (!page) {
				return c.notFound();
			}

			const [pageData] = await db
				.select({
					id: pages.id,
					title: pages.title,
					slug: pages.slug,
					html: sql<string>`${contents.parsedHtml}`,
					meta: sql<string>`${contents.meta}`,
					createdAt: sql<string>`${pages.createdAt}`,
					updatedAt: sql<string>`${pages.updatedAt}`,
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
		wrap('param', v.object({ language: nonEmptyStringValidation })),
		languageExistsMiddleware('param'),
		async (c) => {
			const { language } = c.req.valid('param');

			const [menuLinksResult, slidesResult, [metaResult]] = await Promise.all([
				db.select({
					pageId: menuLinks.pageId,
					text: menuLinks.text,
					parentId: menuLinks.parentId,
					position: menuLinks.position,
					href: sql<string>`${pages.slug}`,
				})
					.from(menuLinks)
					.leftJoin(pages, eq(menuLinks.pageId, pages.id))
					.where(and(
						eq(pages.language, language),
						or(not(eq(menuLinks.parentId, -1)), isNull(menuLinks.parentId)),
						not(eq(pages.slug, ''))
					)),
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
					value: meta.value,
				})
					.from(meta)
					.where(eq(meta.language, language)),
			]);

			const [[slideAspectRatioResult], [footerContentsResult]] = await Promise.all([
				db
					.select({
						value: slideAspectRatio.value,
					})
					.from(slideAspectRatio),
				db.select({
					emails: footerContents.emails,
					phoneNumbers: footerContents.phoneNumbers,
					location: footerContents.location,
					socials: footerContents.socials,
				})
					.from(footerContents)
					.where(eq(footerContents.language, language)),
			]);

			if (footerContentsResult) {
				// @ts-expect-error db returns strings but types are correct
				footerContentsResult.emails = JSON.parse(footerContentsResult.emails);
				// @ts-expect-error db returns strings but types are correct
				footerContentsResult.phoneNumbers = JSON.parse(footerContentsResult.phoneNumbers);
				// @ts-expect-error db returns strings but types are correct
				footerContentsResult.location = JSON.parse(footerContentsResult.location);
				// @ts-expect-error db returns strings but types are correct
				footerContentsResult.socials = JSON.parse(footerContentsResult.socials);
			}

			return c.json({
				menuLinks: menuLinksResult,
				slides: slidesResult,
				slideAspectRatio: slideAspectRatioResult.value,
				footerContents: footerContentsResult,
				meta: metaResult?.value,
			});
		}
	);
