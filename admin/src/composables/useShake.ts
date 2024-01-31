import type { MaybeRef } from 'vue';

export async function useShake(element?: MaybeRef<HTMLElement | undefined>) {
	const target = toValue(element);
	if (!element || !target) {
		return;
	}

	target.classList.toggle('shake', true);
	await new Promise(resolve => setTimeout(resolve, 300));
	target.classList.toggle('shake', false);
}
