import { FetchError } from 'ofetch';

export function useErrors<T extends Record<string, unknown>>(form: T) {
	const { toast, toastGenericError } = useToast();

	const errors = ref(
		Object.keys(form).reduce((p, c) => ({ ...p, [c]: '' }), {}) as {
			[K in keyof T]: T[K] extends object ? Record<string | number, Record<string, string>> : string
		},
	);

	function clearErrors() {
		for (const key in errors.value) {
			errors.value[key] = '';
		}
	}

	function handleError(error: unknown) {
		if (!(error instanceof FetchError)) {
			toastGenericError();
			console.error(error);
			return;
		}
		if (error.statusCode !== 400) {
			toast(`błąd ${error.statusCode} ${error.data.data ?? '[?]'}`, 'error');
			console.error(error);
			return;
		}

		clearErrors();
		let toastInvisibleError = true;

		for (const key in error.data.data) {
			const value = error.data.data[key];
			if (!(key in errors.value)) {
				console.warn(`unknown error returned from server`, { [key]: value });
			} else {
				errors.value[key] = value;
				toastInvisibleError = false;
			}
		}

		toastInvisibleError && toastGenericError();
	}

	return {
		errors,
		clearErrors,
		handleError,
	};
}
