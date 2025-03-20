import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { getTableNames, promptProdContinue } from '.';
import { deleteFile } from '../../utils/image';

await promptProdContinue();

existsSync(`${stylesheetsStoragePath}/global.css`) && await fs.rm(`${stylesheetsStoragePath}/global.css`);

const tables = await getTableNames();

const [rawPages] = await pool.execute('SELECT `id` FROM `pages`');
for (const { id } of rawPages as unknown as { id: number }[]) {
	existsSync(`${stylesheetsStoragePath}/${id}.css`) && await fs.rm(`${stylesheetsStoragePath}/${id}.css`);
}

const [rawDirectories] = await pool.execute('SELECT `path` FROM `directories`');
for (const { path } of rawDirectories as unknown as { path: string }[]) {
	existsSync(`${filesStoragePath}/${path}`) && await fs.rm(`${filesStoragePath}/${path}`, { recursive: true });
}

const [rawFiles] = await pool.execute('SELECT `path`, `mimetype` FROM `files` WHERE `directoryId` IS NULL');
for (const { path, mimetype } of rawFiles as unknown as { path: string; mimetype: string }[]) {
	await deleteFile(`${filesStoragePath}/${path}`, mimetype);
}

await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

for (const { table_name } of tables) {
	await pool.execute(`DROP TABLE ${table_name}`);
}

await pool.execute('DROP TABLE `pages`');
await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

await pool.end();
