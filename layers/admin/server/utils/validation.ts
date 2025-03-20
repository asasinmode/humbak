import * as v from 'valibot';
import { nonEmptyStringValidation } from '~~/server/validation';

export const paginationQueryValidation = v.object({
	query: v.optional(v.string(), ''),
	limit: v.optional(v.pipe(
		v.string(),
		v.transform(Number),
		v.integer(),
	), '5'),
	offset: v.optional(v.pipe(
		v.string(),
		v.transform(Number),
		v.integer(),
	), '0'),
});

export const idParamValidation = v.pipe(
	v.object({
		id: v.pipe(v.string(), v.custom((v) => {
			if (Number.isNaN(Number.parseInt(v as string))) {
				return false;
			}
			return true;
		}, 'musi być cyfrą')),
	}),
	v.transform(({ id }) => ({
		id: Number.parseInt(id),
	})),
);

export const languageQueryValidation = v.object({
	language: nonEmptyStringValidation,
});
