import { exit } from 'node:process';
import { confirm } from '@clack/prompts';
import { type BaseSchema, type Output, ValiError, maxLength, minLength, number, object, optional, parse, string, transform } from 'valibot';
import { env } from '~/env';
import { pool } from '~/db';

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

export function nonEmptyMaxLengthString(length: number) {
	return string([minLength(1, 'nie może być puste'), maxLength(length, `maksymalna długość: ${32}`)]);
}

export function wrap<T extends BaseSchema>(schema: T) {
	return (input: unknown): Output<T> => {
		try {
			const parseResults = parse(schema, input);
			// eslint-disable-next-line
				return parseResults;
		} catch (e) {
			if (!(e instanceof ValiError)) {
				throw e;
			}
			throw JSON.stringify(e.issues.reduce((rv, issue) => {
				const key = issue.path ? issue.path.map(path => path.key as string).join('.') : 'unknown';
				return {
					...rv,
					[key]: issue.message,
				};
			}, {}));
		}
	};
}
