import { like, or, sql } from 'drizzle-orm';

const { files } = tables;

export default defineEventHandler(async (event) => {
	const { query, limit: rawLimit, offset } = useValidatedQuery(event, paginationQueryValidation);
	const limit = Math.min(rawLimit, 100);

	const [items, countResult] = await Promise.all([
		db.select({
			id: files.id,
			path: files.path,
			title: files.title,
			alt: files.alt,
			name: files.name,
			mimetype: files.mimetype,
			width: files.width,
			height: files.height,
		})
			.from(files)
			.where(query
				? or(
						like(files.name, `%${query}%`),
						like(files.path, `%${query}%`),
						like(files.title, `%${query}%`),
						like(files.alt, `%${query}%`),
					)
				: sql`1 = 1`)
			.orderBy(files.name)
			.limit(limit)
			.offset(offset),
		db.select({ count: sql<number>`COUNT(*)` })
			.from(files)
			.where(query
				? or(
						like(files.name, `%${query}%`),
						like(files.path, `%${query}%`),
						like(files.title, `%${query}%`),
						like(files.alt, `%${query}%`),
					)
				: sql`1 = 1`),
	]);

	return { items, count: countResult[0]!.count };
});
