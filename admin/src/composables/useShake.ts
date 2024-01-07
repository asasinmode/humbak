import type { MaybeRef } from 'vue';

// todo use shake when validation errors
export async function useShake(element?: MaybeRef<HTMLElement | undefined>) {
	const target = toValue(element);

	if (!element || !target) {
		return;
	}

	target.classList.toggle('shake', true);
	await new Promise(resolve => setTimeout(resolve, 300));
	target.classList.toggle('shake', false);
}
