import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { filesStoragePath } from '../../helpers/files';
import { pool } from '..';
import { getTableNames, promptProdContinue } from '../../helpers';
import { deleteFile } from '../../helpers/files/image';

await promptProdContinue();

const tables = await getTableNames();

await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
await pool.execute('TRUNCATE TABLE `pages`');

const [rawDirectories] = await pool.execute('SELECT `path` FROM `directories`');
for (const { path } of rawDirectories as unknown as { path: string; }[]) {
	existsSync(`${filesStoragePath}/${path}`) && await rm(`${filesStoragePath}/${path}`, { recursive: true });
}

const [rawFiles] = await pool.execute('SELECT `path`, `mimetype` FROM `files` WHERE `directoryId` IS NULL');
for (const { path, mimetype } of rawFiles as unknown as { path: string; mimetype: string; }[]) {
	await deleteFile(`${filesStoragePath}/${path}`, mimetype);
}

for (const { table_name } of tables) {
	await pool.execute(`TRUNCATE TABLE ${table_name}`);
}

await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
await pool.end();
