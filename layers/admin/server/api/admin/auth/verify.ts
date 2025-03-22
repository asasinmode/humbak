import { eq } from 'drizzle-orm';

const { users } = tables;

// workaround for nuxt server return types
interface IRv {
	jwt: string;
	username: string;
}

export default defineEventHandler(async (event) => {
	const { id } = await adminOnly(event);

	const [user] = await db
		.select({
			id: users.id,
			username: users.username,
		})
		.from(users)
		.where(eq(users.id, id));

	if (!user) {
		setResponseStatus(event, 401, 'Unauthorized');
		return 'użytkownik nie istnieje' as unknown as IRv;
	}

	return {
		jwt: createJwt({ id }),
		username: user.username,
	} satisfies IRv;
});
