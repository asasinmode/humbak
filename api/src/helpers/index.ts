import type { Env, Input as HonoInput, MiddlewareHandler, ValidationTargets } from 'hono';
import { exit } from 'node:process';
import { confirm } from '@clack/prompts';
import { validator } from 'hono/validator';
import * as v from 'valibot';
import { pool } from '../db';
import { env } from '../env';

export async function promptProdContinue() {
	let shouldContinue = true;

	if (env.NODE_ENV === 'production') {
		shouldContinue = await confirm({ message: 'Are you sure?', initialValue: false }) as boolean;
	}

	!shouldContinue && exit(0);
}

export async function getTableNames() {
	const queryResult = await pool.execute(
		`SELECT table_name as table_name FROM information_schema.tables
		WHERE table_schema = '${env.DATABASE_NAME}' AND table_name != 'pages'`
	);

	return queryResult[0] as { table_name: string; }[];
}

export const paginationQueryValidation = v.object({
	query: v.optional(v.string('musi być tesktem'), ''),
	limit: v.optional(v.pipe(
		v.string('musi być tekstem'),
		v.transform(Number),
		v.integer('musi być liczbą całkowitą')
	), '5'),
	offset: v.optional(v.pipe(
		v.string('musi być tekstem'),
		v.transform(Number),
		v.integer('musi być liczbą całkowitą')
	), '0'),
});

export function nonEmptyMaxLengthString(length = 256) {
	return v.pipe(v.string('musi być tesktem'), v.minLength(1, 'nie może być puste'), v.maxLength(length, `maksymalna długość: ${length}`));
}

export const nonEmptyStringValidation = v.pipe(v.string('musi być tekstem'), v.minLength(1, 'nie może być puste'));

export const positiveIntegerValidation = v.pipe(v.number('musi być liczbą'), v.integer('musi być liczbą całkowitą'), v.minValue(1, 'minimalna wartość: 1'));

export const nullablePositiveIntegerValidation = v.union([positiveIntegerValidation, v.null()], 'musi być liczbą całkowitą większą niż 1 lub null');

export const languageQueryValidation = v.object({
	language: nonEmptyStringValidation,
});

export const idParamValidationMiddleware = wrap('param', v.pipe(
	v.object({
		id: v.pipe(v.string('musi być tekstem'), v.custom((v) => {
			if (Number.isNaN(Number.parseInt(v as string))) {
				return false;
			}
			return true;
		}, 'musi być cyfrą')),
	}),
	v.transform(({ id }) => ({
		id: Number.parseInt(id),
	}))
));

type HasUndefined<T> = undefined extends T ? true : false;

// copied from https://github.com/honojs/middleware/blob/main/packages/valibot-validator/src/index.ts
export function wrap<
	T extends v.GenericSchema,
	Target extends keyof ValidationTargets,
	E extends Env,
	P extends string,
	In = v.InferInput<T>,
	Out = v.InferOutput<T>,
	I extends HonoInput = {
		in: HasUndefined<In> extends true
			? {
					[K in Target]?: K extends 'json'
						? In
						: HasUndefined<keyof ValidationTargets[K]> extends true
							? { [K2 in keyof In]?: ValidationTargets[K][K2] }
							: { [K2 in keyof In]: ValidationTargets[K][K2] }
				}
			: {
					[K in Target]: K extends 'json'
						? In
						: HasUndefined<keyof ValidationTargets[K]> extends true
							? { [K2 in keyof In]?: ValidationTargets[K][K2] }
							: { [K2 in keyof In]: ValidationTargets[K][K2] }
				};
		out: { [K in Target]: Out };
	},
	V extends I = I
>(target: Target, schema: T): MiddlewareHandler<E, P, V> {
	// @ts-expect-error not typed well
	return validator(target, (value, c) => {
		const parseResults = v.safeParse(schema, value);

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
				for (let i = 0; i < issue.path.length - 1; i++) {
					const key = issue.path[i].key as string | number;

					pointer[key] ||= {};
					pointer = pointer[key];
				}

				const lastIssue = issue.path[issue.path.length - 1];
				pointer[lastIssue.key as string | number] = message;
			}

			return c.json(errors, 400);
		}

		return parseResults.output;
	});
}
