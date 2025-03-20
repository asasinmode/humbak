import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { files } from './files';
import { slides } from './slides';

export const filesToSlides = mysqlTable('filesToSlides', {
	slideId: int('slideId').notNull().references(() => slides.id, { onDelete: 'cascade' }),
	fileId: int('fileId').notNull().references(() => files.id, { onDelete: 'cascade' }),
});
