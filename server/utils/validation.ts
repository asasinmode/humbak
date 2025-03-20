import type { H3Event } from 'h3';
import * as v from 'valibot';

function parse<
	TInput,
	TOutput,
	TIssue extends v.BaseIssue<unknown>,
>(target: unknown, schema: v.BaseSchema<TInput, TOutput, TIssue>) {
	const parseResults = v.safeParse(schema, target);

	if (!parseResults.success) {
		const errors: Record<string, unknown> = {};

		for (const issue of parseResults.issues) {
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
				const key = issue.path[i]!.key as string | number;

				pointer[key] ||= {};
				pointer = pointer[key];
			}

			const lastIssue = issue.path[issue.path.length - 1];
			pointer[lastIssue!.key as string | number] = message;
		}

		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
			data: errors,
		});
	}

	return parseResults.output;
}

export function useValidatedParams<
	TInput,
	TOutput,
	TIssue extends v.BaseIssue<unknown>,
>(
	event: H3Event,
	schema: v.BaseSchema<TInput, TOutput, TIssue>,
): TOutput {
	return parse(getRouterParams(event), schema);
}

export function useValidatedQuery<
	TInput,
	TOutput,
	TIssue extends v.BaseIssue<unknown>,
>(
	event: H3Event,
	schema: v.BaseSchema<TInput, TOutput, TIssue>,
): TOutput {
	return parse(getQuery(event), schema);
}

export async function useValidatedBody<
	TInput,
	TOutput,
	TIssue extends v.BaseIssue<unknown>,
>(
	event: H3Event,
	schema: v.BaseSchema<TInput, TOutput, TIssue>,
): Promise<TOutput> {
	return parse(await readBody(event), schema);
}
