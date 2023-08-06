import { pool } from '..';
import { getTableNames, promptProdContinue } from '~/helpers';

await promptProdContinue();

const tables = await getTableNames();

await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

await pool.execute('TRUNCATE TABLE `pages`');

await Promise.all(
	tables.filter(({ table_name }) => table_name !== 'pages').map(table =>
		pool.execute(`TRUNCATE TABLE ${table.table_name}`)
	)
);

await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
await pool.end();
