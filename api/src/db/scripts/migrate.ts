import { fileURLToPath } from 'node:url';
import { exit } from 'node:process';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from '../index';
import { promptProdContinue } from '~/helpers';

await promptProdContinue();

await migrate(db, { migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)) });

exit(0);
