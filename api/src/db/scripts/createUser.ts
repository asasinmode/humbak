import process from 'node:process';
import { randomUUID } from 'node:crypto';
import { pool } from '..';
import { hashPassword } from '../../helpers/auth';
import { promptProdContinue } from '../../helpers';

await promptProdContinue();

const username = process.argv[2];
const password = process.argv[3];

if (!username) {
	console.log('name not provided');
	process.exit(0);
}

if (!password) {
	console.log('password not provided');
	process.exit(0);
}

const id = randomUUID();
const hashedPassword = await hashPassword(password);

await pool.execute(`INSERT INTO users (id, username, password) VALUES ('${id}', '${username}', '${hashedPassword}')`);

await pool.end();
