import { inArray } from 'drizzle-orm';
import * as v from 'valibot';

const { files } = tables;

const idValidation = v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.integer());

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const { ids } = useValidatedQuery(event, v.object({
		ids: v.union([
			idValidation,
			v.array(idValidation),
		]),
	}));

	const items = await db.select({
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
		.where(inArray(files.id, typeof ids === 'number' ? [ids] : ids));

	return items;
});
