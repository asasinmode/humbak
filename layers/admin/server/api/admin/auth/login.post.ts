import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { nonEmptyMaxLengthString } from '~~/server/validation';

const { users } = tables;

const TWO_HOURS_IN_S = 60 * 60 * 2;

export default defineEventHandler(async (event) => {
	const { username, password } = await useValidatedBody(event, v.object({
		username: nonEmptyMaxLengthString(),
		password: nonEmptyMaxLengthString(1024),
	}));

	const [user] = await db
		.select({
			id: users.id,
			password: users.password,
		})
		.from(users)
		.where(eq(users.username, username));

	if (!user) {
		setResponseStatus(event, 401, 'Unauthorized');
		return 'użytkownik nie istnieje';
	}

	const isPasswordValid = await comparePassword(user.password, password);
	if (!isPasswordValid) {
		setResponseStatus(event, 401, 'Unauthorized');
		return 'nieprawidłowe hasło';
	}

	setCookie(event, 'auth', JSON.stringify({ username, id: user.id } satisfies IAuthCookie), { maxAge: TWO_HOURS_IN_S });
	setResponseStatus(event, 201, 'No Content');
});
