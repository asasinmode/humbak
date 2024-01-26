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

export function useMobileMenu(
	windowWidth: number,
	secondFocusableElement: () => Element,
	secondToLastFocusableElement: () => Element
) {
	const isExpanded = ref(false);

	function toggleMenu(isOpen: boolean) {
		isExpanded.value = isOpen;
		document.body.style.overflow = isOpen ? 'hidden' : '';
	}

	function firstElementFocusIn(event: FocusEvent) {
		if (event.relatedTarget !== secondFocusableElement()) {
			toggleMenu(true);
		}
	}

	// todo when on first element and click toggle (backdrop) this happens then toggle is called and reverses
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
