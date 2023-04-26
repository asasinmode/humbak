import url from 'node:url';
import { exit } from 'process';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './index';

await migrate(db, { migrationsFolder: url.fileURLToPath(new URL('./migrations', import.meta.url)) });

// move to scripts directory
// add drop/truncate? scripts

exit(0);
