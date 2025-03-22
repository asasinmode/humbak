import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { nonEmptyMaxLengthString } from '~~/server/validation';

const { users } = tables;

export default defineEventHandler(async (event) => {
	const { id } = await adminOnly(event);

	const { newPassword, oldPassword } = await useValidatedBody(event, v.object({
		oldPassword: nonEmptyMaxLengthString(1024),
		newPassword: nonEmptyMaxLengthString(1024),
	}));

	const [user] = await db
		.select({ password: users.password })
		.from(users)
		.where(eq(users.id, id));

	if (!user) {
		setResponseStatus(event, 401, 'Unauthorized');
		return 'użytkownik nie istnieje';
	}

	const isPasswordValid = await comparePassword(user.password, oldPassword);
	if (!isPasswordValid) {
		setResponseStatus(event, 401, 'Unauthorized');
		return 'nieprawidłowe hasło';
	}

	const newHashedPassword = await hashPassword(newPassword);
	await db.update(users).set({ password: newHashedPassword }).where(eq(users.id, id));

	setResponseStatus(event, 204, 'No Content');
});
