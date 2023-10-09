export const useCombobox = <T>(
	modelValue: Ref<T | undefined>,
	computedOptions: ComputedRef<{ text: string; value: T | undefined; }[]>,
	listboxRef: Ref<HTMLElement | undefined>,
	selectOnly?: Ref<boolean>,
	emitCallback?: (value?: T) => void
) => {
	const isExpanded = ref(false);
	const cursoredOverIndex = ref<number>();

	watch(modelValue, (value) => {
		cursoredOverIndex.value = undefined;
		for (let i = 0; i < computedOptions.value.length; i++) {
			if (computedOptions.value[i].value === value) {
				cursoredOverIndex.value = i;
				break;
			}
		}
	});

	const selectedOptionText = computed(() => {
		const selectedOptionIndex = computedOptions.value.findIndex(option => option.value === modelValue.value);
		return computedOptions.value[selectedOptionIndex]?.text;
	});

	function moveCursor(value: number) {
		if (!isExpanded.value) {
			isExpanded.value = true;
			return;
		}

		if (cursoredOverIndex.value === undefined) {
			cursoredOverIndex.value = value > 0 ? 0 : computedOptions.value.length - 1;
		} else {
			cursoredOverIndex.value = (cursoredOverIndex.value + value) % computedOptions.value.length;
			if (cursoredOverIndex.value < 0) {
				cursoredOverIndex.value = computedOptions.value.length + cursoredOverIndex.value;
			}
		}

		if (selectOnly?.value) {
			selectOption(cursoredOverIndex.value, false, false);
		}
	}

	function selectOption(index?: number, skipEmit = false, collapse = true) {
		if (index === undefined) {
			modelValue.value = undefined;
		} else {
			modelValue.value = computedOptions.value[index].value;
		}

		if (collapse) {
			isExpanded.value = false;
		}

		// eslint-disable-next-line
		nextTick(() => {
			!skipEmit && emitCallback && emitCallback(modelValue.value);
		});
	}

	function closeIfFocusedOutside(event: FocusEvent) {
		const target = event.relatedTarget as HTMLElement | null;
		if (!target || !listboxRef.value || !listboxRef.value.contains(target)) {
			isExpanded.value = false;
		}
	}

	function confirmChoice() {
		isExpanded.value = false;
		if (selectOnly?.value) {
			return;
		}

		if (cursoredOverIndex.value !== undefined) {
			selectOption(cursoredOverIndex.value);
		} else {
			emitCallback && emitCallback(modelValue.value);
		}
	}

	return {
		isExpanded,
		cursoredOverIndex,
		moveCursor,
		selectOption,
		confirmChoice,
		closeIfFocusedOutside,
		selectedOptionText,
	};
};
