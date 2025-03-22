import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { nonEmptyMaxLengthString } from '~~/server/validation';

const { users } = tables;

// workaround for nuxt server return types
interface IRv {
	jwt: string;
}

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
		return 'użytkownik nie istnieje' as unknown as IRv;
	}

	const isPasswordValid = await comparePassword(user.password, password);
	if (!isPasswordValid) {
		setResponseStatus(event, 401, 'Unauthorized');
		return 'nieprawidłowe hasło' as unknown as IRv;
	}

	return {
		jwt: createJwt({ id: user.id }),
	};
});
