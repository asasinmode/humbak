import { writeFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { object, string } from 'valibot';
import { wrap } from '../helpers';
import { adminStylesheetsPath } from '../helpers/files';

export const app = new Hono()
	.post('/', wrap('json', object({ value: string() })), async (c) => {
		const { value } = c.req.valid('json');

		await writeFile(`${adminStylesheetsPath}/global.css`, value);

		return c.body(null, 204);
	});

export type AppType = typeof app;
