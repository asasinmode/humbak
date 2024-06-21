import { writeFile } from 'node:fs/promises';
import { Hono } from 'hono';
import * as v from 'valibot';
import { wrap } from '../helpers';
import { stylesheetsStoragePath } from '../helpers/files';

export const app = new Hono()
	.post('/', wrap('json', v.object({ value: v.string() })), async (c) => {
		const { value } = c.req.valid('json');

		await writeFile(`${stylesheetsStoragePath}/global.css`, value);

		return c.body(null, 204);
	});
