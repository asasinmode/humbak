const { directories } = tables;

export default defineEventHandler(async () => {
	const result = await db
		.select({
			id: directories.id,
			parentId: directories.parentId,
			name: directories.name,
		})
		.from(directories);

	return result;
});
