export function useMobileMenu(
	windowWidth: number,
	secondFocusableElement: () => Element,
	secondToLastFocusableElement: () => Element,
) {
	const isExpanded = ref(false);

	function toggleMenu(isOpen: boolean) {
		isExpanded.value = isOpen;
		if (!isOpen || window.innerWidth < 1024) {
			document.body.style.overflow = isOpen ? 'hidden' : '';
		}
	}

	function firstElementFocusIn(event: FocusEvent) {
		if (event.relatedTarget !== secondFocusableElement()) {
			toggleMenu(true);
		}
	}

	function firstElementFocusOut(event: FocusEvent) {
		if (event.relatedTarget !== secondFocusableElement()) {
			toggleMenu(false);
		}
	}

	function lastElementFocusIn(event: FocusEvent) {
		if (window.innerWidth < windowWidth && event.relatedTarget !== secondToLastFocusableElement()) {
			toggleMenu(true);
		}
	}

	function lastElementFocusOut(event: FocusEvent) {
		if (window.innerWidth < windowWidth && event.relatedTarget !== secondToLastFocusableElement()) {
			toggleMenu(false);
		}
	}

	return {
		isExpanded,
		toggleMenu,
		firstElementFocusIn,
		firstElementFocusOut,
		lastElementFocusIn,
		lastElementFocusOut,
	};
}
