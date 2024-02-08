<script setup lang="ts">
import { focusableElements } from '@humbak/shared';

type Focusable = Element & {
	focus: () => void;
};

const { grantConsent, revokeConsent } = useGtag();

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

onMounted(() => {
	const savedValue = localStorage.getItem('trackingConsent');
	if (savedValue === null) {
		open();
	} else {
		savedValue === 'true' ? grantConsent() : revokeConsent();
	}
});

function agree() {
	localStorage.setItem('trackingConsent', 'true');
	grantConsent();
	close();
}

function disagree() {
	localStorage.setItem('trackingConsent', 'false');
	revokeConsent();
	close();
}
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
			class="max-w-[90vw] w-xl bg-neutral-1 grid grid-cols-2 shadow-lg lg:max-w-5xl"
		>
			<h1 class="col-span-full">
				cześć
			</h1>
			<button
				class="w-full py-3 bg-gray-2 hoverable:bg-gray-3 text-center"
				@click="disagree"
			>
				Nie wyrażam zgody
			</button>
			<button
				ref="closeButton"
				class="w-full py-3 bg-humbak hoverable:bg-humbak-5 text-center"
				@click="agree"
			>
				Wyrażam zgodę
			</button>
		</article>
	</div>
</template>
