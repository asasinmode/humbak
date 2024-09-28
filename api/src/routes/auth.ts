import { and, eq, not } from 'drizzle-orm';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import * as v from 'valibot';
import { db } from '../db';
import { users } from '../db/schema/users';
import { env } from '../env';
import { nonEmptyMaxLengthString, wrap } from '../helpers';
import { comparePassword, hashPassword } from '../helpers/auth';
import { jwt } from '../helpers/jwt';

const TWO_HOURS_IN_S = 60 * 60 * 2;

export const app = new Hono()
	.post(
		'/login',
		wrap('json', v.object({
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

			const token = await sign({ id: user.id, exp: Date.now() / 1000 + TWO_HOURS_IN_S }, env.JWT_SECRET);
			return c.text(token);
		}
	)
	.get('/verify', jwt, async (c) => {
		const jwtPayload = c.get('jwtPayload');
		if (!jwtPayload.id) {
			throw new Error('no id in jwt payload');
		}

		const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, jwtPayload.id));
		if (!user) {
			return c.body('użytkownik nie istnieje', 401);
		}

		return c.body(null, 204);
	})
	.post(
		'/changeUsername',
		jwt,
		wrap('json', v.object({
			username: nonEmptyMaxLengthString(),
		})),
		async (c) => {
			const jwtPayload = c.get('jwtPayload');
			if (!jwtPayload.id) {
				throw new Error('no id in jwt payload');
			}

			const { username } = c.req.valid('json');

			const [user] = await db
				.select({
					id: users.id,
					password: users.password,
				})
				.from(users)
				.where(eq(users.id, jwtPayload.id));
			if (!user) {
				return c.text('użytkownik nie istnieje', 401);
			}

			const [userWithSameName] = await db
				.select({ id: users.id })
				.from(users)
				.where(and(eq(users.username, username), not(eq(users.id, user.id))));
			if (userWithSameName) {
				return c.text('użytkownik o podanej nazwie istnieje', 403);
			}

			return c.body(null, 204);
		}
	)
	.post(
		'/changePassword',
		jwt,
		wrap('json', v.object({
			oldPassword: nonEmptyMaxLengthString(1024),
			newPassword: nonEmptyMaxLengthString(1024),
		})),
		async (c) => {
			const jwtPayload = c.get('jwtPayload');
			if (!jwtPayload.id) {
				throw new Error('no id in jwt payload');
			}

			const { oldPassword, newPassword } = c.req.valid('json');

			const [user] = await db
				.select({
					password: users.password,
				})
				.from(users)
				.where(eq(users.id, jwtPayload.id));

			if (!user) {
				return c.text('użytkownik nie istnieje', 401);
			}

			const isPasswordValid = await comparePassword(user.password, oldPassword);
			if (!isPasswordValid) {
				return c.text('nieprawidłowe hasło', 401);
			}

			const newHashedPassword = await hashPassword(newPassword);
			await db.update(users).set({ password: newHashedPassword }).where(eq(users.id, jwtPayload.id));

			return c.body(null, 204);
		}
	);
