export type Focusable = Element & {
	focus: () => void;
};

export function useFocusableElements(parent: HTMLElement) {
	const elements = Array.from(parent.querySelectorAll<Focusable>('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]'));

	const inputGroups: Record<string, { elements: HTMLInputElement[]; startIndex: number; endIndex: number }> = {};
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
	for (const { elements: groupElements, startIndex, endIndex } of Object.values(inputGroups)) {
		const checkedElement = groupElements.find(el => el.checked);
		if (!checkedElement) {
			continue;
		}
		const length = endIndex - startIndex + 1;
		elements.splice(startIndex - elementsOffset, length, checkedElement);
		elementsOffset = length - 1;
	}

	return elements;
}
