import { ref } from 'vue';
import { TRPCClientError } from '@trpc/client';

const { confirm } = useConfirm();
const { toast, toastGenericError } = useToast();

export const useForm = <T extends Record<string, unknown>>(
	form: T,
	saveCallback: () => Promise<unknown>,
	elementToShake?: Parameters<typeof useShake>[0],
	checkForExternalHasChanged = () => false
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

	function clearErrors() {
		for (const key in errors.value) {
			// @ts-expect-error it's a valid key
			errors.value[key] = '';
		}
	}
	function clearFields() {
		for (const key in form) {
			fields[key].value = form[key];
		}
	}
	async function clearForm(element?: HTMLElement, skipConfirm = false, continueMessage = false) {
		if (!skipConfirm && hasChanged()) {
			const proceed = await confirm(element, {
				text: `Masz niezapisane zmiany. Czy na pewno chcesz ${continueMessage ? 'kontynuować' : 'wyczyścić dane'}?`,
				okText: continueMessage ? 'kontynuuj' : 'wyczyść',
			});

			if (!proceed) {
				return false;
			}
		}

		clearErrors();
		clearFields();
		updateValues(form);
		return true;
	}

	function handleError(error: unknown) {
		if (!(error instanceof TRPCClientError) || error.data.httpStatus !== 400) {
			toastGenericError();
			throw error;
		}

		clearErrors();

		try {
			errors.value = JSON.parse(error.message);
		} catch (e) {
			toastGenericError();
			throw new Error(`Parsing error message failed. ${error.message}`);
		}
	}

	async function sendForm(toastSuccess = true) {
		clearErrors();
		isSaving.value = true;

		try {
			await saveCallback();
			toastSuccess && toast('zapisano zmiany');
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
		clearErrors();
	}

	function hasChanged() {
		for (const key in form) {
			if (fields[key].value !== initValue[key]) {
				return true;
			}
		}
		return checkForExternalHasChanged();
	}

	return {
		...fields,
		errors,
		isSaving,
		clearErrors,
		clearFields,
		clearForm,
		handleError,
		sendForm,
		updateValues,
		hasChanged,
	};
};
