<script setup lang="ts">
import { focusableElements } from '@humbak/shared';

type Focusable = Element & {
	focus: () => void;
};

const isOpen = ref(false);
const dialog = ref<HTMLElement>();
const closeButton = ref<HTMLButtonElement>();

function open() {
	isOpen.value = true;
	nextTick(() => dialog.value && focusableElements(dialog.value)[0].focus());

	document.body.style.overflow = 'hidden';
	document.addEventListener('keydown', focusCloseButton);
}

function close() {
	document.removeEventListener('keydown', focusCloseButton);
	document.body.style.overflow = '';

	isOpen.value = false;
}

function focusCloseButton(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		event.preventDefault();
		closeButton.value?.focus();
	}
}

function handleTab(event: KeyboardEvent) {
	if (event.key === 'Tab') {
		const elements = dialog.value ? focusableElements(dialog.value) : [];
		const focusedElement = document.activeElement as Focusable;
		const focusedElementIndex = elements.indexOf(focusedElement);

		if (event.shiftKey && focusedElementIndex === 0) {
			elements[elements.length - 1].focus();
			event.preventDefault();
		} else if (!event.shiftKey && focusedElementIndex === elements.length - 1) {
			elements[0].focus();
			event.preventDefault();
		}
	}
}

defineExpose({
	close,
	open,
});
</script>

<template>
	<div
		v-if="isOpen"
		class="fixed inset-0 z-200 grid h-screen w-screen place-items-center of-x-hidden of-y-auto bg-black/40 pb-20 pt-14 lg:pt-24"
		@keydown="handleTab"
	>
		<article
			ref="dialog"
			role="dialog"
			aria-live="polite"
			aria-modal="true"
			:aria-hidden="!isOpen"
			class="max-w-[90vw] w-sm rounded bg-neutral-1 px-2 py-4 shadow-lg lg:max-w-5xl lg:w-xl dark:bg-neutral-9 md:px-4"
		>
			<h1>cześć</h1>
			<button
				ref="closeButton"
				class="neon-red"
				@click="close"
			>
				Zamknij
			</button>
		</article>
	</div>
</template>
