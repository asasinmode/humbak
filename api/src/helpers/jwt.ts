import { jwt as honoJwt } from 'hono/jwt';
import { env } from '../env';

export const jwt = honoJwt({
	secret: env.JWT_SECRET,
});
