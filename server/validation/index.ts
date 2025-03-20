import * as v from 'valibot';

v.setSpecificMessage(v.array, () => 'musi być listą');
v.setSpecificMessage(v.boolean, () => 'musi być true lub false');
v.setSpecificMessage(v.integer, () => 'musi być liczbą całkowitą');
v.setSpecificMessage(v.maxLength, issues => `maksymalna długość: ${issues.expected}`);
v.setSpecificMessage(v.minValue, issues => `minimalna wartość: ${issues.expected}`);
v.setSpecificMessage(v.nonEmpty, () => 'nie może być puste');
v.setSpecificMessage(v.null, () => 'musi być wartością `null`');
v.setSpecificMessage(v.number, () => 'musi być liczbą');
v.setSpecificMessage(v.object, () => 'musi być obiektem');
v.setSpecificMessage(v.picklist, issues => `musi być jednym z ${issues.expected}`);
v.setSpecificMessage(v.record, () => 'musi być obiektem');
v.setSpecificMessage(v.string, () => 'musi być tekstem');

export function nonEmptyMaxLengthString(length = 256) {
	return v.pipe(
		v.string(),
		v.nonEmpty(),
		v.maxLength(length),
	);
}

export const nonEmptyStringValidation = v.pipe(v.string(), v.nonEmpty());

export const positiveIntegerValidation = v.pipe(v.number(), v.integer(), v.minValue(1));

export const nullablePositiveIntegerValidation = v.union(
	[positiveIntegerValidation, v.null()],
	'musi być liczbą całkowitą większą niż 1 lub null',
);
