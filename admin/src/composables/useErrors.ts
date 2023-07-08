import { ref } from 'vue';
import { TRPCClientError } from '@trpc/client';

const { toast } = useToast();

type TRPCError = {
	message: string;
	path: string[];
};

export const useErrors = <T extends Readonly<string[]>>(fields: T) => {
	const fieldToError = ref(
		fields.reduce((p, c) => ({ ...p, [c]: '' }), {}) as Record<T[number], string>
	);

	function resetErrors() {
		for (const key in fieldToError.value) {
			// @ts-expect-error key is string
			fieldToError.value[key] = '';
		}
	}

	return {
		fieldToError,
		resetErrors,
		handleError(error: unknown) {
			if (!(error instanceof TRPCClientError)) {
				throw error;
			}

			const errors: TRPCError[] = JSON.parse(error.message);
			let toastUnknown = false;

			resetErrors();

			for (const { path, message } of errors) {
				for (const property of path) {
					// @ts-expect-error can't go through keys of ref.value
					if (property in fieldToError.value) {
						// @ts-expect-error property is a string
						fieldToError.value[property] = message;
					} else {
						console.error(`Unspecified path (${property}) error: ${message}`);
						toastUnknown = true;
					}
				}
			}

			toastUnknown && toast('Coś poszło nie tak 😓', 'error');
		},
	};
};
