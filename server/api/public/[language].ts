import { and, eq, isNull, not, or, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { nonEmptyStringValidation } from '~~/server/validation';

const { menuLinks, pages, meta, slides, slideAspectRatio, footerContents } = tables;

export default defineEventHandler(async (event) => {
	const { language } = useValidatedParams(event, v.object({ language: nonEmptyStringValidation }));

	const [languageResult] = await db
		.selectDistinct({ language: pages.language })
		.from(pages)
		.where(eq(pages.language, language))
		.limit(1);

	if (!languageResult) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

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
				not(eq(pages.slug, '')),
			)),
		db.select({
			id: slides.id,
			content: slides.parsedContent,
		})
			.from(slides)
			.orderBy(slides.createdAt)
			.where(and(
				eq(slides.language, language),
				eq(slides.isHidden, false),
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

	return {
		menuLinks: menuLinksResult,
		slides: slidesResult,
		slideAspectRatio: slideAspectRatioResult!.value,
		footerContents: footerContentsResult!,
		meta: metaResult?.value,
	};
});
