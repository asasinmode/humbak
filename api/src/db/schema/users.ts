import { mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: serial('id').primaryKey(),
	username: varchar('username', { length: 256 }).notNull(),
});
