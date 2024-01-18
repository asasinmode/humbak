import { Hono } from 'hono';
import { object } from 'valibot';
import { sign } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { env } from '../env';
import { comparePassword } from '../helpers/auth';
import { jwt } from '../helpers/jwt';
import { db } from '../db';
import { users } from '../db/schema/users';
import { nonEmptyMaxLengthString, wrap } from '../helpers';

const TWO_HOURS_IN_MS = 1000 * 60 * 60 * 2;

export const app = new Hono()
	.post(
		'/login',
		wrap('json', object({
			username: nonEmptyMaxLengthString(),
			password: nonEmptyMaxLengthString(1024),
		})),
		async (c) => {
			const { username, password } = c.req.valid('json');

			const [user] = await db
				.select({
					id: users.id,
					password: users.password,
				})
				.from(users)
				.where(eq(users.username, username));

			if (!user) {
				return c.text('użytkownik nie istnieje', 401);
			}

			const isPasswordValid = await comparePassword(user.password, password);
			if (!isPasswordValid) {
				return c.text('nieprawidłowe hasło', 401);
			}

			const token = await sign({ id: user.id, exp: Date.now() + TWO_HOURS_IN_MS }, env.JWT_SECRET);
			return c.text(token);
		}
	)
	.get('/verify', jwt, async (c) => {
		return c.body(null, 204);
	});
