import { exit } from 'node:process';
import { confirm } from '@clack/prompts';
import { maxLength, minLength, object, optional, safeParse, string, transform } from 'valibot';
import type { Env, MiddlewareHandler, ValidationTargets } from 'hono';
import type { BaseSchema, Input, Output, SchemaWithTransform } from 'valibot';
import { validator } from 'hono/validator';
import { env } from '../env';
import { pool } from '../db';

export async function promptProdContinue() {
	let shouldContinue = true;

	if (env.NODE_ENV === 'production') {
		shouldContinue = await confirm({ message: 'Are you sure?', initialValue: false }) as boolean;
	}

	!shouldContinue && exit(0);
}

export async function getTableNames() {
	const queryResult = await pool.execute(
		`SELECT table_name FROM information_schema.tables
		WHERE table_schema = '${env.DATABASE_DATABASE}'`
	);

	return queryResult[0] as { table_name: string; }[];
}

export const paginationQueryValidation = transform(object({
	query: optional(string(), ''),
	limit: optional(string(), '5'),
	offset: optional(string(), '0'),
}), ({ query, limit, offset }) => ({
	query,
	limit: Number.parseInt(limit),
	offset: Number.parseInt(offset),
}));

export const languageQueryValidation = object({
	language: string([minLength(1)]),
});

export const idParamValidation = transform(object({
	id: string(),
}), ({ id }) => ({
	id: Number.parseInt(id),
}));

export function nonEmptyMaxLengthString(length = 256) {
	return string([minLength(1, 'nie może być puste'), maxLength(length, `maksymalna długość: ${32}`)]);
}

export function wrap<
	S extends BaseSchema,
	T extends S | SchemaWithTransform<S, any>,
	Target extends keyof ValidationTargets,
	E extends Env,
	P extends string,
	I = Input<T>,
	O = Output<T>,
	V extends {
		in: { [K in Target]: I };
		out: { [K in Target]: O };
	} = {
		in: { [K in Target]: I };
		out: { [K in Target]: O };
	}
>(target: Target, schema: T): MiddlewareHandler<E, P, V> {
	return validator(target, (value, c) => {
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
