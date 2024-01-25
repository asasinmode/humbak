import { ref } from 'vue';

export type IMenuLink = {
	pageId: number;
	text: string;
	parentId: number | null;
	position: number;
	href: string;
};

export type IMenuTreeItem = {
	pageId: number;
	text: string;
	href: string;
	position: number;
	children: IMenuTreeItem[];
};

export function transformMenuLinks(menuLinks: IMenuLink[]) {
	const rv = extractWithParentId(menuLinks, null);
	for (const child of rv) {
		child.children = extractWithParentId(menuLinks, child.pageId);
		for (const grandchild of child.children) {
			grandchild.children = extractWithParentId(menuLinks, grandchild.pageId);
		}
	}
	return rv;
}

export function extractWithParentId(menuLinks: IMenuLink[], parentId: null | number): IMenuTreeItem[] {
	const rv: IMenuTreeItem[] = [];
	let index = 0;
	while (index < menuLinks.length) {
		let currentLink = menuLinks[index];

		if (currentLink.parentId === parentId) {
			let indexInDestination = 0;
			for (const { position } of rv) {
				if (position < currentLink.position) {
					indexInDestination += 1;
				}
			}

			currentLink = menuLinks.splice(index, 1)[0];

			rv.splice(indexInDestination, 0, {
				pageId: currentLink.pageId,
				text: currentLink.text,
				href: currentLink.href,
				position: currentLink.position,
				children: [],
			});

			index -= 1;
		}
		index += 1;
	}
	return rv;
}

export function useMobileMenu(firstFocusableElement: () => Element, secondToLastFocusableElement: () => Element) {
	const isExpanded = ref(false);

	function toggleMenu(isOpen: boolean) {
		isExpanded.value = isOpen;
		document.body.style.overflow = isOpen ? 'hidden' : '';
	}

	function toggleButtonFocusIn(event: FocusEvent) {
		if (event.relatedTarget === firstFocusableElement()) {
			toggleMenu(false);
			return;
		}
		if (event.relatedTarget !== null && event.relatedTarget !== document.documentElement) {
			return;
		}
		toggleMenu(true);
	}

	function toggleButtonFocusOut(event: FocusEvent) {
		if (event.relatedTarget === firstFocusableElement()) {
			toggleMenu(true);
			return;
		}
		if (event.relatedTarget !== null && event.relatedTarget !== document.documentElement) {
			return;
		}
		toggleMenu(false);
	}

	function lastElementFocusIn(event: FocusEvent) {
		if (window.innerWidth >= 768 || event.relatedTarget === secondToLastFocusableElement()) {
			return;
		}
		toggleMenu(true);
	}

	function lastElementFocusOut(event: FocusEvent) {
		if (window.innerWidth >= 768 || event.relatedTarget === secondToLastFocusableElement()) {
			return;
		}
		toggleMenu(false);
	}

	return {
		isExpanded,
		toggleMenu,
		toggleButtonFocusIn,
		toggleButtonFocusOut,
		lastElementFocusIn,
		lastElementFocusOut,
	};
}
