import { Hono } from 'hono';
import { object } from 'valibot';
import { jwt } from 'src/helpers/jwt';
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
	)
	.get('/verify', jwt, async (c) => {
		return c.body(null, 204);
	});
