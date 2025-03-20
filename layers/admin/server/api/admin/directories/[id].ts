export default defineEventHandler(async (event) => {
	const { id } = useValidatedParams(event, dirIdParamValidation);
	await getTargetDir(true, id);

	return await dirData(id, false);
});
