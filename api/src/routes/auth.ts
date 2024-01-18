import { Hono } from 'hono';
import { object } from 'valibot';
import { sign } from 'hono/jwt';
import { env } from '../env';
import { jwt } from '../helpers/jwt';
import { nonEmptyMaxLengthString, wrap } from '../helpers';

export const app = new Hono()
	.post(
		'/login',
		wrap('json', object({
			username: nonEmptyMaxLengthString(),
			password: nonEmptyMaxLengthString(1024),
		})),
		async (c) => {
			const token = await sign({ testData: 'value' }, env.JWT_SECRET);
			return c.text(token);
		}
	)
	.get('/verify', jwt, async (c) => {
		return c.body(null, 204);
	});
