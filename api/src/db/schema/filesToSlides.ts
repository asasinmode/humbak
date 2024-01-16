import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { slides } from './slides';
import { files } from './files';

export const filesToSlides = mysqlTable('filesToSlides', {
	slideId: int('slideId').notNull().references(() => slides.id, { onDelete: 'cascade' }),
	fileId: int('fileId').notNull().references(() => files.id, { onDelete: 'cascade' }),
});
