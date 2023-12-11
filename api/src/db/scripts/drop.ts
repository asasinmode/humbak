import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { pool } from '..';
import { adminFilesPath } from '../../helpers/files';
import { getTableNames, promptProdContinue } from '../../helpers';

await promptProdContinue();

const tables = await getTableNames();

const [rawDirectories] = await pool.execute('SELECT `path` FROM `directories`');
for (const { path } of rawDirectories as unknown as { path: string; }[]) {
	existsSync(`${adminFilesPath}/${path}`) && await rm(`${adminFilesPath}/${path}`, { recursive: true });
}

const [rawFiles] = await pool.execute('SELECT `path` FROM `files` WHERE `directoryId` IS NULL');
for (const { path } of rawFiles as unknown as { path: string; }[]) {
	existsSync(`${adminFilesPath}/${path}`) && await rm(`${adminFilesPath}/${path}`);
}

await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

for (const { table_name } of tables.filter(({ table_name }) => table_name !== 'pages')) {
	await pool.execute(`DROP TABLE ${table_name}`);
}

await pool.execute('DROP TABLE `pages`');
await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

await pool.end();
