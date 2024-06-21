import { sql } from 'drizzle-orm';
import { datetime, json, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { nonEmptyMaxLengthString, nonEmptyStringValidation } from '../../helpers';

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

export const insertFooterContentsSchema = v.object({
	language: nonEmptyMaxLengthString(32),
	emails: v.optional(v.array(nonEmptyStringValidation, 'musi być listą')),
	phoneNumbers: v.optional(v.array(nonEmptyStringValidation, 'musi być listą')),
	location: v.optional(v.object({
		text: v.pipe(v.string('musi być tekstem'), v.maxLength(256, 'maksymalna długość: 256')),
		value: v.pipe(v.string('musi być tekstem'), v.maxLength(256, 'maksymalna długość: 256')),
	})),
	socials: v.optional(v.array(v.object({
		type: v.picklist(knownSocials),
		value: nonEmptyMaxLengthString(),
	}))),
});
