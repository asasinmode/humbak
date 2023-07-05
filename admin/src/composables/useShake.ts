import type { MaybeRef } from 'vue';

export const useShake = async (element?: MaybeRef<HTMLElement | null | undefined>) => {
	const target = isRef(element) ? element.value : element;

	if (!element || !target) {
		return;
	}

	target.classList.toggle('shake', true);
	await new Promise(resolve => setTimeout(resolve, 300));
	target.classList.toggle('shake', false);
};
