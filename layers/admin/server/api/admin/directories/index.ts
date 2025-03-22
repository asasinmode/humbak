const { directories } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const result = await db
		.select({
			id: directories.id,
			parentId: directories.parentId,
			name: directories.name,
		})
		.from(directories);

	return result;
});
