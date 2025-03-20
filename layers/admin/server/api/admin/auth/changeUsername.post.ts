import { and, eq, not } from 'drizzle-orm';
import * as v from 'valibot';
import { nonEmptyMaxLengthString } from '~~/server/validation';

const { users } = tables;

export default defineEventHandler(async (event) => {
	const { id } = JSON.parse(getCookie(event, 'auth')!);

	const { username } = await useValidatedBody(event, v.object({
		username: nonEmptyMaxLengthString(),
	}));

	const [user] = await db
		.select({
			id: users.id,
			password: users.password,
		})
		.from(users)
		.where(eq(users.id, id));
	if (!user) {
		setResponseStatus(event, 401, 'Unauthorized');
		return 'użytkownik nie istnieje';
	}

	const [userWithSameName] = await db
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.username, username), not(eq(users.id, user.id))));
	if (userWithSameName) {
		setResponseStatus(event, 403, 'Forbidden');
		return 'użytkownik o podanej nazwie istnieje';
	}

	setResponseStatus(event, 204, 'No Content');
});
