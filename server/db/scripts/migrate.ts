import path from 'node:path';
import url from 'node:url';
import { migrate } from 'drizzle-orm/mysql2/migrator';

import { promptProdContinue } from '.';

await promptProdContinue();

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

await migrate(db, { migrationsFolder: path.resolve(dirname, '../migrations') });

await pool.end();
