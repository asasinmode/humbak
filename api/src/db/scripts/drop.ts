import { pool } from '..';
import { getTableNames, promptProdContinue } from '../../helpers';

await promptProdContinue();

const tables = await getTableNames();

for (const { table_name } of tables.filter(({ table_name }) => table_name !== 'pages')) {
	await pool.execute(`DROP TABLE ${table_name}`);
}

await pool.execute('DROP TABLE `pages`');

await pool.end();
