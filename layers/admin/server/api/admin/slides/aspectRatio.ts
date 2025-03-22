const { slideAspectRatio } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const [result] = await db
		.select({ value: slideAspectRatio.value })
		.from(slideAspectRatio);

	return result!.value;
});
