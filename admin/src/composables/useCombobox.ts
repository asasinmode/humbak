import type { MaybeRef } from 'vue';

export const useCombobox = (
	modelValue: Ref<string | undefined>,
	rawOptions: MaybeRef<{ text: string; value: string; }[]>,
	listboxRef: Ref<HTMLElement | null | undefined>
) => {
	const isExpanded = ref(false);
	const cursoredOverIndex = ref<number | undefined>();

	const options = computed(() => isRef(rawOptions) ? rawOptions.value : rawOptions);

	function updateCursoredIndexToSelected(value?: string) {
		cursoredOverIndex.value = undefined;
		if (value) {
			for (let i = 0; i < options.value.length; i++) {
				if (value === options.value[i].value) {
					cursoredOverIndex.value = i;
					break;
				}
			}
		}
	}

	function moveCursor(value: number) {
		if (!isExpanded.value) {
			isExpanded.value = true;
			return;
		}

		if (cursoredOverIndex.value === undefined) {
			cursoredOverIndex.value = value > 0 ? 0 : (options.value.length - 1);
			return;
		}

		cursoredOverIndex.value = (cursoredOverIndex.value + value) % options.value.length;
		if (cursoredOverIndex.value < 0) {
			cursoredOverIndex.value = options.value.length + cursoredOverIndex.value;
		}
	}

	function selectOption(index?: number) {
		isExpanded.value = false;
		if (index !== undefined) {
			modelValue.value = options.value[index].value;
			cursoredOverIndex.value = index;
		}
	}

	function expandAndSelectFirst() {
		isExpanded.value = true;
		updateCursoredIndexToSelected(modelValue.value);
		if (cursoredOverIndex.value === undefined) {
			cursoredOverIndex.value = 0;
		}
	}

	function closeIfFocusedOutside(event: FocusEvent) {
		const target = event.relatedTarget as HTMLElement | null;
		if (!target || !listboxRef.value || !listboxRef.value.contains(target)) {
			isExpanded.value = false;
		}
	}

	return {
		isExpanded,
		cursoredOverIndex,
		updateCursoredIndexToSelected,
		moveCursor,
		selectOption,
		expandAndSelectFirst,
		closeIfFocusedOutside,
	};
};
