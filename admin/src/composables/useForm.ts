import { ref } from 'vue';
import { TRPCClientError } from '@trpc/client';

const { toast } = useToast();

type TRPCError = {
	message: string;
	path: string[];
};

export const useForm = <
		T extends Record<string, unknown>
	>(form: T) => {
	const fields = {} as { [K in keyof T]: Ref<T[K]> };
	for (const key in form) {
		// @ts-expect-error it's a valid key
		fields[key] = ref(form[key]);
	}

	const errors = ref(
		Object.keys(form).reduce((p, c) => ({ ...p, [c]: '' }), {}) as Record<keyof T, string>
	);

	function resetErrors() {
		for (const key in errors.value) {
			// @ts-expect-error it's a valid key
			errors.value[key] = '';
		}
	}
	function resetFields() {
		for (const key in form) {
			fields[key].value = form[key];
		}
	}
	function resetForm() {
		resetErrors();
		resetFields();
	}

	function handleError(error: unknown) {
		if (!(error instanceof TRPCClientError)) {
			throw error;
		}

		resetErrors();
		let toastUnknown = false;

		for (const { path, message } of JSON.parse(error.message) as TRPCError[]) {
			for (const property of path) {
				// @ts-expect-error it's a valid key
				if (property in errors.value) {
					// @ts-expect-error it's also a valid key
					errors.value[property] = message;
				} else {
					console.error(`Unspecified path (${property}) error: ${message}`);
					toastUnknown = true;
				}
			}
		}

		toastUnknown && toast('Coś poszło nie tak 😓', 'error');
	}

	return {
		...fields,
		errors,
		resetErrors,
		resetFields,
		resetForm,
		handleError,
	};
};
