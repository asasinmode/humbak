import { insertMetaSchema } from '~~/server/db/schema/meta';

const { meta } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const input = await useValidatedBody(event, insertMetaSchema);

	await db
		.insert(meta)
		.values(input)
		.onDuplicateKeyUpdate({
			set: {
				...input,
				updatedAt: new Date(),
			},
		});

	setResponseStatus(event, 204, 'No Content');
});
