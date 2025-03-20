<script setup lang="ts">
const { gtag } = useGtag();

const isOpen = ref(false);
const dialog = ref<HTMLElement>();
const closeButton = ref<HTMLButtonElement>();

function open() {
	isOpen.value = true;
	nextTick(() => dialog.value && useFocusableElements(dialog.value)[0]!.focus());

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
		const elements = dialog.value ? useFocusableElements(dialog.value) : [];
		const focusedElement = document.activeElement as Focusable;
		const focusedElementIndex = elements.indexOf(focusedElement);

		if (event.shiftKey && focusedElementIndex === 0) {
			elements[elements.length - 1]!.focus();
			event.preventDefault();
		} else if (!event.shiftKey && focusedElementIndex === elements.length - 1) {
			elements[0]!.focus();
			event.preventDefault();
		}
	}
}

onMounted(() => {
	const savedValue = localStorage.getItem('trackingConsent');
	if (savedValue === null) {
		open();
	} else if (savedValue === 'true') {
		gtag('consent', 'update', {
			analytics_storage: 'granted',
		});
	}
});

function agree() {
	localStorage.setItem('trackingConsent', 'true');
	gtag('consent', 'update', {
		analytics_storage: 'granted',
	});
	close();
}

function disagree() {
	localStorage.setItem('trackingConsent', 'false');
	gtag('consent', 'update', {
		analytics_storage: 'denied',
	});
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
			class="grid grid-cols-[auto_1fr] max-w-[90vw] w-3xl gap-y-1 bg-neutral-1 shadow-lg lg:max-w-5xl"
		>
			<h3 class="col-span-full mx-auto pt-4 text-center text-4xl">
				Ciasteczka 🍪
			</h3>
			<p class="col-span-full p-4">
				Ta strona wykorzystuje pliki cookies pochodzące od podmiotów trzecich w celu korzystania z narzędzi zewnętrznych (Google Analytics).
				Do informacji, które są gromadzone w plikach cookies od podmiotów trzecich, mają dostęp dostawcy wymienionych narzędzi zewnętrznych.
			</p>

			<TheTrackingDialogContent />

			<button
				class="trackingButton w-full bg-gray-2 py-3 text-center hoverable:bg-gray-3"
				@click="disagree"
			>
				Nie wyrażam zgody
			</button>
			<button
				ref="closeButton"
				class="trackingButton w-full whitespace-nowrap bg-humbak py-3 text-center hoverable:bg-humbak-5"
				@click="agree"
			>
				Wyrażam zgodę
			</button>
		</article>
	</div>
</template>

<style>
.trackingButton {
	padding-inline: clamp(0.5rem, -2rem + 10vw, 2rem);
}
</style>
