import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const pages = mysqlTable('pages', {
	id: int('id').autoincrement().primaryKey(),
	title: varchar('title', { length: 256 }).primaryKey(),
	slug: varchar('slug', { length: 256 }).notNull(),
	menuText: varchar('menuText', { length: 256 }).notNull(),
});
