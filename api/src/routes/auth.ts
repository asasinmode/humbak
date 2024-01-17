import { Hono } from 'hono';
import { object } from 'valibot';
import { nonEmptyMaxLengthString, wrap } from '../helpers';

export const app = new Hono()
	.post(
		'/login',
		wrap('json', object({
			username: nonEmptyMaxLengthString(),
			password: nonEmptyMaxLengthString(1024),
		})),
		async (c) => {
			return c.text('token');
		}
	);
