import fs from 'node:fs/promises';
import * as v from 'valibot';

export default defineEventHandler(async (event) => {
	const { value } = await useValidatedBody(event, v.object({ value: v.string() }));

	await fs.writeFile(`${stylesheetsStoragePath}/global.css`, value);

	setResponseStatus(event, 204, 'No Content');
});
