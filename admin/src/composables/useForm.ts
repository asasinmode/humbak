import { ref } from 'vue';
import { TRPCClientError } from '@trpc/client';

const { confirm } = useConfirm();
const { toast } = useToast();

type TRPCError = {
	message: string;
	path: string[];
};

export const useForm = <T extends Record<string, unknown>>(
	form: T,
	saveCallback: () => Promise<unknown>,
	elementToShake?: Parameters<typeof useShake>[0]
) => {
	const isSaving = ref(false);
	const initValue = structuredClone(form);

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
	async function resetForm(element?: HTMLElement | null) {
		if (hasChanged()) {
			const proceed = await confirm(element, {
				title: 'niezapisane zmiany',
				text: 'Masz niezapisane zmiany. Czy na pewno chcesz wyczyścić dane?',
				okText: 'wyczyść',
			});

			if (!proceed) {
				return;
			}
		}

		resetErrors();
		resetFields();
	}

	function handleError(error: unknown) {
		if (!(error instanceof TRPCClientError) || error.data.httpStatus !== 400) {
			toast('coś poszło nie tak 😓', 'error');
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
					console.error(`unknown path (${property}) error: ${message}`);
					toastUnknown = true;
				}
			}
		}

		toastUnknown && toast('coś poszło nie tak 😓', 'error');
	}

	async function sendForm() {
		resetErrors();
		isSaving.value = true;

		try {
			await saveCallback();
			toast('zapisano zmiany');
		} catch (e) {
			handleError(e);
			await useShake(elementToShake);
		} finally {
			isSaving.value = false;
		}
	}

	function updateValues(data: { [K in keyof T]: T[K]; } & Record<string, any>) {
		for (const key in form) {
			fields[key].value = data[key];
			initValue[key] = data[key];
		}
	}

	function hasChanged() {
		for (const key in form) {
			if (fields[key].value !== initValue[key]) {
				return true;
			}
		}
		return false;
	}

	return {
		...fields,
		errors,
		isSaving,
		resetErrors,
		resetFields,
		resetForm,
		handleError,
		sendForm,
		updateValues,
	};
};
