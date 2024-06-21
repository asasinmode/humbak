import { ref } from 'vue';

export type Focusable = Element & {
	focus: () => void;
};

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

export function focusableElements(parent: HTMLElement) {
	const elements = Array.from(parent.querySelectorAll<Focusable>('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]'));

	const inputGroups: Record<string, { elements: HTMLInputElement[]; startIndex: number; endIndex: number; }> = {};
	for (let i = 0; i < elements.length; i++) {
		const element = elements[i] as HTMLInputElement;
		if (
			element.tagName !== 'INPUT'
			|| (element as HTMLInputElement).type !== 'radio'
			|| !(element as HTMLInputElement).name
		) {
			continue;
		}

		const { name } = element;
		inputGroups[name] ||= { elements: [], startIndex: i, endIndex: i };
		inputGroups[name].elements.push(element);
		inputGroups[name].endIndex = i;
	}

	let elementsOffset = 0;
	for (const key in inputGroups) {
		const { elements: groupElements, startIndex, endIndex } = inputGroups[key];
		const checkedIndex = groupElements.findIndex(el => el.checked);
		if (checkedIndex === -1) {
			continue;
		}
		const length = endIndex - startIndex + 1;
		elements.splice(startIndex - elementsOffset, length, groupElements[checkedIndex]);
		elementsOffset = length - 1;
	}

	return elements;
}
