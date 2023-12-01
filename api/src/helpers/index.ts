import { exit } from 'node:process';
import { confirm } from '@clack/prompts';
import { type BaseSchema, maxLength, minLength, number, object, optional, safeParse, string, transform } from 'valibot';
import { validator } from 'hono/validator';
import { env } from '../env';
import { pool } from '../db';

export async function promptProdContinue() {
	let shouldContinue = true;

	if (env.NODE_ENV === 'production') {
		shouldContinue = await confirm({ message: 'Are you sure?', initialValue: false }) as boolean;
	}

	if (!shouldContinue) {
		exit(0);
	}
}

export async function getTableNames() {
	const queryResult = await pool.execute(
		`SELECT table_name FROM information_schema.tables
		WHERE table_schema = '${env.DATABASE_DATABASE}'`
	);

	return queryResult[0] as { table_name: string; }[];
}

export const paginationQueryInput = transform(object({
	query: optional(string()),
	limit: optional(number()),
	offset: optional(number()),
}), ({ query, limit, offset }) => ({
	query: query === undefined ? '' : query,
	limit: limit === undefined ? 5 : limit,
	offset: offset === undefined ? 0 : offset,
}));

export function nonEmptyMaxLengthString(length = 256) {
	return string([minLength(1, 'nie może być puste'), maxLength(length, `maksymalna długość: ${32}`)]);
}

export const languageQueryValidation = object({ language: string([minLength(1)]) });

export function wrap<
	T extends BaseSchema,
	U extends Parameters<typeof validator>[0]
>(schema: T, type: U) {
	return validator(type, (value, c) => {
		console.log('validating', value);
		const parseResults = safeParse(schema, value);

		if (!parseResults.success) {
			console.log('issues', parseResults.issues);
			return c.json({ error: 'oopsie' }, 400);
		}

		console.log('parsed into', parseResults.output);

		return parseResults.output;
	});
}
