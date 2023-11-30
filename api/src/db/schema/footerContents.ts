import { sql } from 'drizzle-orm';
import { datetime, json, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { array, object, optional, picklist, string } from 'valibot';
import { nonEmptyMaxLengthString } from '~/helpers';

const knownSocials = ['facebook', 'youtube', 'instagram', 'twitter'] as const;

export const footerContents = mysqlTable('footerContents', {
	language: varchar('language', { length: 32 }).primaryKey().notNull(),
	emails: json('emails').$type<string[]>().notNull().default([]),
	phoneNumbers: json('phoneNumbers').$type<string[]>().notNull().default([]),
	location: json('location')
		.$type<{ text: string; value: string; }>()
		.notNull()
		.default({ text: 'Gdzie nas znaleźć', value: '' }),
	socials: json('socials')
		.$type<{ type: typeof knownSocials[number]; value: string; }[]>()
		.notNull()
		.default([]),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertFooterContentSchema = object({
	language: nonEmptyMaxLengthString(32),
	emails: optional(array(string())),
	phoneNumbers: optional(array(string())),
	location: optional(object({ text: nonEmptyMaxLengthString(), value: nonEmptyMaxLengthString() })),
	socials: optional(array(object({ type: picklist(knownSocials), value: nonEmptyMaxLengthString() }))),
});
