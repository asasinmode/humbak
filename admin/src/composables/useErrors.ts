const { toast, toastGenericError } = useToast();

export class FetchError {
	data: any;
	status: number;
	constructor(data: any, status: number) {
		this.data = data;
		this.status = status;
	}
}

export function useErrors<T extends Record<string, unknown>>(form: T) {
	const errors = ref(
		Object.keys(form).reduce((p, c) => ({ ...p, [c]: '' }), {}) as {
			[K in keyof T]: T[K] extends object ? Record<string | number, Record<string, string>> : string
		}
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
			console.error(error);
			return;
		}
		if (error.status !== 400) {
			toast(`błąd ${error.status} ${error.data}`, 'error');
			console.error(error);
			return;
		}

		clearErrors();
		let toastInvisibleError = true;

		for (const key in error.data) {
			const value = error.data[key];
			// @ts-expect-error key is valid
			if (!(key in errors.value)) {
				console.warn(`unknown error returned from server`, { [key]: value });
			} else {
				// @ts-expect-error key is valid
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
