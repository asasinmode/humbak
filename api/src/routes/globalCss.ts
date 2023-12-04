import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { object, string } from 'valibot';
import { wrap } from 'src/helpers';

export const app = new Hono()
	.post('/', wrap('json', object({ value: string() })), async (c) => {
		const { value } = c.req.valid('json');

		await writeFile(fileURLToPath(new URL('../../public/stylesheets/global.css', import.meta.url)), value);

		return c.text('', 201);
	});

export type AppType = typeof app;
