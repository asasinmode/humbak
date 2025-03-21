import process from 'node:process';
import confirm from '@inquirer/confirm';
import './setupGlobals';

export async function promptProdContinue() {
	let shouldContinue = true;

	if (process.env.NODE_ENV === 'production') {
		shouldContinue = await confirm({ message: 'Are you sure?', default: false }) as boolean;
	}

	!shouldContinue && process.exit(0);
}

export async function getTableNames() {
	const queryResult = await pool.execute(
		`SELECT table_name as table_name FROM information_schema.tables
		WHERE table_schema = '${process.env.NUXT_DATABASE_NAME}' AND table_name != 'pages'`,
	);

	return queryResult[0] as { table_name: string }[];
}
