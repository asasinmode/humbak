const { slideAspectRatio } = tables;

export default defineEventHandler(async () => {
	const [result] = await db
		.select({ value: slideAspectRatio.value })
		.from(slideAspectRatio);

	return result!.value;
});
