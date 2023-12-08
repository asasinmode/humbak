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
		const parseResults = safeParse(schema, value);

		if (!parseResults.success) {
			const errors: Record<string, unknown> = {};

			for (const key in parseResults.issues) {
				const issue = parseResults.issues[key];
				const message = issue.message;

				if (!issue.path) {
					errors.unknown = message;
					continue;
				}

				if (issue.path.length === 1) {
					errors[issue.path[0].key as string || 'unknown'] = message;
					continue;
				}

				let pointer = errors as any;
				for (let i = issue.path.length - 1; i > 0; i--) {
					const key = issue.path[i].key as string | number;
					pointer[key] ||= {};
					pointer = pointer[key];
				}
				pointer[issue.path[0].key as string] = message;
			}

			return c.json(errors, 400);
		}

		return parseResults.output;
	});
}
