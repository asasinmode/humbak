const { toast, toastGenericError } = useToast();

export class FetchError {
	data: object;
	status: number;
	constructor(data: object, status: number) {
		this.data = data;
		this.status = status;
	}
}

export function useErrors<T extends Record<string, unknown>>(form: T) {
	const errors = ref(
		Object.keys(form).reduce((p, c) => ({ ...p, [c]: '' }), {}) as Record<keyof T, string>
	);

	function clearErrors() {
		for (const key in errors.value) {
			// @ts-expect-error it's a valid key
			errors.value[key] = '';
		}
	}

	function handleError(error: unknown) {
		if (!(error instanceof FetchError)) {
			toastGenericError();
			throw error;
		}
		if (error.status !== 400) {
			toast(`coś poszło nie tak 😓. ${error.status} ${error.data}`);
		}

		clearErrors();

		for (const key in error.data) {
			// @ts-expect-error key is valid
			const value = error.data[key];
			// @ts-expect-error key is valid
			if (!(key in errors.value)) {
				console.warn(`unknown error returned from server`, { [key]: value });
			} else {
				// @ts-expect-error key is valid
				errors.value[key] = value;
			}
		}
	}

	return {
		errors,
		clearErrors,
		handleError,
	};
}
