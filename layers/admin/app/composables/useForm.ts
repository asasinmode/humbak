import { ref } from 'vue';

const { confirm } = useConfirm();
const { toast } = useToast();

export function useForm<T extends Record<string, unknown>>(
	form: T,
	saveCallback: () => Promise<unknown>,
	elementToShake?: () => Parameters<typeof useShake>[0],
	checkForExternalHasChanged = () => false,
) {
	const isSaving = ref(false);
	const initValue = structuredClone(form);

	const fields = {} as { [K in keyof T]: Ref<T[K]> };
	for (const key in form) {
		// @ts-expect-error it's a valid key
		fields[key] = ref(form[key]);
	}

	const { errors, clearErrors, handleError } = useErrors(form);

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

	async function sendForm(toastSuccess = true) {
		clearErrors();
		isSaving.value = true;

		try {
			await saveCallback();
			toastSuccess && toast('zapisano zmiany');
		} catch (e) {
			handleError(e);
			useShake(elementToShake?.());
		} finally {
			isSaving.value = false;
		}
	}

	function updateValues(data: { [K in keyof T]: T[K]; } & Record<string, any>) {
		for (const key in form) {
			fields[key].value = data[key];
			initValue[key] = structuredClone(data[key]);
		}
		clearErrors();
	}

	function hasChanged() {
		for (const key in form) {
			const value = typeof fields[key].value === 'object' ? JSON.stringify(fields[key].value) : fields[key].value;
			const init = typeof initValue[key] === 'object' ? JSON.stringify(initValue[key]) : initValue[key];

			if (value !== init) {
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
