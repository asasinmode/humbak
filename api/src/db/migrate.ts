import { exit } from 'process';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './index';

await migrate(db, { migrationsFolder: decodeURI(new URL('./migrations', import.meta.url).pathname.slice(1)) });

exit(0);
