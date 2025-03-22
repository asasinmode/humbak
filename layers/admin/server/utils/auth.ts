import type { H3Event } from 'h3';
import jwt from 'jsonwebtoken';

export async function adminOnly(event: H3Event): Promise<IJwtPayload> {
	const auth = getRequestHeader(event, 'Authorization');
	const token = auth && auth.split(' ')[1];

	if (!token) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
			message: 'brak lub nieprawidłowy header auth',
		});
	}

	const verifiedToken = await new Promise(resolve =>
		jwt.verify(token, useRuntimeConfig().jwtSecret, (err, decoded) => err ? resolve(undefined) : resolve(decoded)),
	);

	const url = getRequestURL(event);

	if (url.pathname === '/api/admin/menuLinks' || !verifiedToken || typeof verifiedToken !== 'object' || !('id' in verifiedToken)) {
		setResponseHeader(event, 'x-humbak-logged-out', true);
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
			message: 'payload otrzymanego tokenu jest nieprawidłowy',
		});
	}

	return {
		id: verifiedToken.id as string,
	};
};

const TWO_HOURS_IN_S = 60 * 60 * 2;

export function createJwt(payload: IJwtPayload) {
	return jwt.sign(
		payload,
		useRuntimeConfig().jwtSecret,
		{ expiresIn: TWO_HOURS_IN_S },
	);
}
