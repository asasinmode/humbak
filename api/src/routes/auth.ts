import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { Hono } from 'hono';
import { object } from 'valibot';
import { sign } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { env } from '../env';
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
				return c.text('Unauthorized', 401);
			}

			const isPasswordValid = await comparePassword(user.password, password);
			if (!isPasswordValid) {
				return c.text('Unauthorized', 401);
			}

			const token = await sign({ id: user.id, exp: Date.now() + TWO_HOURS_IN_MS }, env.JWT_SECRET);
			return c.text(token);
		}
	)
	.get('/verify', jwt, async (c) => {
		return c.body(null, 204);
	});

async function hashPassword(password: string) {
	const salt = randomBytes(16).toString('hex');
	const buffer = await asyncScrypt(password, salt);

	return `${buffer.toString('hex')}:${salt}`;
}

async function comparePassword(hashedPassword: string, passwordToCompare: string) {
	const [hash, salt] = hashedPassword.split(':');
	const hashBuffer = Buffer.from(hash, 'hex');
	const bufferToTest = await asyncScrypt(passwordToCompare, salt);
	return timingSafeEqual(hashBuffer, bufferToTest);
}

function asyncScrypt(password: string, salt: string) {
	return new Promise<Buffer>((resolve, reject) => scrypt(password, salt, 64, (err, buff) => {
		if (err) {
			reject(err);
		}
		resolve(buff);
	}));
}
