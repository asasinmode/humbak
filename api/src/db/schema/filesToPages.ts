import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { pages } from './pages';
import { files } from './files';

export const filesToPages = mysqlTable('filesToPages', {
	pageId: int('pageId').notNull().references(() => pages.id, { onDelete: 'cascade' }),
	fileId: int('fileId').notNull().references(() => files.id, { onDelete: 'cascade' }),
});
