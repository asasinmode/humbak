import * as v from 'valibot';
import { nonEmptyMaxLengthString } from '~~/server/validation';

const { slideAspectRatio } = tables;

export default defineEventHandler(async (event) => {
	const { value } = await useValidatedBody(event, v.object({ value: nonEmptyMaxLengthString() }));
	await db.update(slideAspectRatio).set({ value, updatedAt: new Date() });

	setResponseStatus(event, 204, 'No Content');
});
