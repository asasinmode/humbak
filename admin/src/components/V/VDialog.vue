<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';

const props = defineProps<{
	action?: () => unknown;
	closeAction?: () => unknown;
	loading?: boolean;
	classContainer?: string;
	classCloseButton?: string;
	noOpenButton?: boolean;
	activator?: HTMLElement | null;
	disableClickOutside?: boolean;
}>();

type Focusable = Element & {
	focus: () => void;
};

const isOpen = ref(false);
const dialog = ref<HTMLElement | null>();
const openButton = ref<InstanceType<typeof VButton>>();
const closeButton = ref<InstanceType<typeof VButton>>();

function open() {
	isOpen.value = true;
	nextTick(() => dialog.value && focusableElements(dialog.value)[0].focus());

	document.body.style.overflow = 'hidden';
	document.addEventListener('keydown', closeIfEscape);
	document.addEventListener('keydown', callActionIfEnter);
}

function close() {
	if (props.loading) {
		return;
	}

	document.removeEventListener('keydown', callActionIfEnter);
	document.removeEventListener('keydown', closeIfEscape);
	document.body.style.overflow = '';

	if (!props.noOpenButton) {
		openButton.value?.element?.focus();
	} else {
		props.activator?.focus();
	}

	props.closeAction && props.closeAction();
	isOpen.value = false;
}

function closeIfEscape(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		event.preventDefault();

		if (props.disableClickOutside) {
			closeButton.value?.element?.focus();
			return;
		}

		close();
	}
}

function callActionIfEnter(event: KeyboardEvent) {
	if (!props.action) {
		return;
	}

	if (event.key === 'Enter' && document.activeElement?.nodeName !== 'BUTTON') {
		props.action();
		event.preventDefault();
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

function focusableElements(parent: HTMLElement) {
	return Array.from(parent.querySelectorAll<Focusable>('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]'));
}

defineExpose({
	close,
	open,
});
</script>

<template>
	<VButton v-if="!noOpenButton" ref="openButton" v-bind="$attrs" @click="open">
		<slot name="button" />
	</VButton>
	<Teleport to="body">
		<div
			v-if="isOpen"
			class="fixed inset-0 z-100 grid h-screen w-screen place-items-center of-x-hidden of-y-auto bg-black/40 pb-20 pt-14 lg:pt-24"
			@click.self="!disableClickOutside && close" @keydown="handleTab"
		>
			<article
				ref="dialog"
				role="dialog" aria-live="polite" aria-modal="true" :aria-busy="loading" :aria-hidden="!isOpen"
				class="max-w-[80vw] w-sm rounded bg-neutral-1 px-2 py-4 shadow-lg lg:max-w-5xl lg:w-xl dark:bg-neutral-9 md:px-4"
				:class="classContainer"
			>
				<slot />
				<VButton
					ref="closeButton"
					class="neon-red"
					:class="classCloseButton"
					:disabled="loading"
					@click="close"
				>
					anuluj
				</VButton>
				<slot name="post" />
			</article>
		</div>
	</Teleport>
</template>
