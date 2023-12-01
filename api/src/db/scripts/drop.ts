import { pool } from '..';
import { getTableNames, promptProdContinue } from '../../helpers';

await promptProdContinue();

const tables = await getTableNames();

await Promise.all(
	tables.filter(({ table_name }) => table_name !== 'pages').map(table =>
		pool.execute(`DROP TABLE ${table.table_name}`)
	)
);

await pool.execute('DROP TABLE `pages`');

await pool.end();
