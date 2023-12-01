import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, pool } from '..';
import { promptProdContinue } from '../../helpers';

await promptProdContinue();

await migrate(db, { migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)) });

await pool.end();
