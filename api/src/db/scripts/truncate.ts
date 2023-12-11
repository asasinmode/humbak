import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { adminFilesPath } from 'src/helpers/files';
import { pool } from '..';
import { getTableNames, promptProdContinue } from '../../helpers';

await promptProdContinue();

const tables = await getTableNames();

await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

await pool.execute('TRUNCATE TABLE `pages`');

const [rawDirectories] = await pool.execute('SELECT `path` FROM `directories`');

for (const { path } of rawDirectories as unknown as { path: string; }[]) {
	existsSync(`${adminFilesPath}/${path}`) && await rm(`${adminFilesPath}/${path}`, { recursive: true });
}

for (const { table_name } of tables.filter(({ table_name }) => table_name !== 'pages')) {
	await pool.execute(`TRUNCATE TABLE ${table_name}`);
}

await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
await pool.end();
