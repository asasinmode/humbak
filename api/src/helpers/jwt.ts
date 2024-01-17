import { jwt as honoJwt } from 'hono/jwt';

export const jwt = honoJwt({
	secret: 'test',
});
