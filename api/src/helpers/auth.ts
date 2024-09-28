import { Buffer } from 'node:buffer';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

export async function hashPassword(password: string) {
	const salt = randomBytes(16).toString('hex');
	const buffer = await asyncScrypt(password, salt);

	return `${buffer.toString('hex')}:${salt}`;
}

export async function comparePassword(hashedPassword: string, passwordToCompare: string) {
	const [hash, salt] = hashedPassword.split(':');
	const hashBuffer = Buffer.from(hash, 'hex');
	const bufferToTest = await asyncScrypt(passwordToCompare, salt);
	return timingSafeEqual(hashBuffer, bufferToTest);
}

export function asyncScrypt(password: string, salt: string) {
	return new Promise<Buffer>((resolve, reject) => scrypt(password, salt, 64, (err, buff) => {
		if (err) {
			reject(err);
		}
		resolve(buff);
	}));
}
